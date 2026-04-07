"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Code,
  Cpu,
  Database,
  Feather,
  Gem,
  Lock,
  Rocket,
  Server,
  ShieldAlert,
} from "lucide-react";

import type { CourseIconKey, CourseMarketplaceCatalog, CourseListing } from "@/lib/course-marketplace/types";
import { useAuthSession } from "@/components/auth-session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const iconMap: Record<CourseIconKey, typeof Feather> = {
  feather: Feather,
  cpu: Cpu,
  database: Database,
  code: Code,
  server: Server,
  lock: Lock,
  gem: Gem,
  rocket: Rocket,
};

type ListingFilter = "paid" | "free";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isFreeListing(listing: CourseListing) {
  const priceLabel = listing.priceLabel?.toLowerCase() ?? "";
  return priceLabel.includes("free");
}

function ListingRow({
  listing,
  onRequireAuth,
  user,
}: {
  listing: CourseListing;
  onRequireAuth: () => void;
  user: { email?: string | null } | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.05] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-primary/15 text-primary">
              {listing.providerName}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-muted-foreground">
              {listing.confidence} confidence
            </Badge>
          </div>
          <h4 className="text-base font-semibold sm:text-lg">{listing.title}</h4>
          <p className="max-w-2xl text-sm text-muted-foreground">{listing.summary}</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-base font-semibold text-primary sm:text-lg">
            {listing.priceLabel ?? "Price on source"}
          </div>
          <div className="text-xs text-muted-foreground">
            {listing.durationLabel ?? "Duration not exposed"}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{listing.providerName}</span>
        <span>Captured {formatTimestamp(listing.capturedAt)}</span>
      </div>
      <div className="mt-4">
        <Button
          size="sm"
          className="font-semibold"
          onClick={() => {
            if (!user) {
              onRequireAuth();
              return;
            }

            window.open(listing.url, "_blank", "noopener,noreferrer");
          }}
        >
          {user ? "Open Source" : "Log in to Open Source"}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CourseMarketplace({ catalog }: { catalog: CourseMarketplaceCatalog }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [listingFilter, setListingFilter] = useState<ListingFilter>("paid");
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const activeCategory = useMemo(
    () => catalog.categories.find((category) => category.id === activeCategoryId) ?? null,
    [activeCategoryId, catalog.categories]
  );

  const filteredListings = useMemo(() => {
    if (!activeCategory) {
      return [];
    }

    return activeCategory.listings.filter((listing) =>
      listingFilter === "free" ? isFreeListing(listing) : !isFreeListing(listing)
    );
  }, [activeCategory, listingFilter]);

  const freeListingCount = useMemo(
    () => activeCategory?.listings.filter(isFreeListing).length ?? 0,
    [activeCategory]
  );

  const paidListingCount = useMemo(
    () => activeCategory?.listings.filter((listing) => !isFreeListing(listing)).length ?? 0,
    [activeCategory]
  );

  const handleRequireAuth = () => {
    if (isAuthLoading) {
      return;
    }

    setAuthPromptOpen(true);
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 xl:gap-8">
        {catalog.categories.map((category) => {
          const Icon = iconMap[category.iconKey];
          const listingCount = category.listings.length;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setListingFilter("paid");
                setActiveCategoryId(category.id);
              }}
              className="h-full text-left"
            >
              <Card className="glassmorphic group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                <CardHeader className="p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-white/10 text-xs text-muted-foreground",
                        listingCount > 0 && "border-primary/40 text-primary"
                      )}
                    >
                      {listingCount} tracked
                    </Badge>
                  </div>
                  <CardTitle className="font-headline pt-4 text-xl sm:text-2xl">{category.name}</CardTitle>
                  <CardDescription className="text-sm leading-6">{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end px-5 pb-5 sm:px-6 sm:pb-6">
                  <div className="mt-4 flex items-center justify-between text-sm font-semibold sm:mt-6">
                    <span className="text-muted-foreground">View source catalog</span>
                    <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Dialog
        open={Boolean(activeCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setListingFilter("paid");
            setActiveCategoryId(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90svh] w-[calc(100vw-1rem)] max-w-5xl flex-col overflow-hidden border-white/10 bg-[#090b17] p-0 text-foreground sm:max-h-[85vh] sm:w-full">
          {activeCategory && (
            <div className="flex min-h-0 flex-1 flex-col">
              <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6">
                <DialogTitle className="font-headline text-2xl sm:text-3xl">{activeCategory.name}</DialogTitle>
                <DialogDescription className="max-w-3xl text-sm leading-6">
                  {activeCategory.description} DigiTantra pricing remains visible here, while the list below
                  focuses on tracked third-party offerings and current provider status.
                </DialogDescription>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Badge variant="secondary" className="bg-primary/15 text-primary">
                    DigiTantra: {activeCategory.ownedPrice}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-muted-foreground">
                    {activeCategory.ownedTimeline}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-muted-foreground">
                    {activeCategory.listings.length} tracked listings
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Course Type
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {listingFilter === "paid"
                        ? `Showing ${paidListingCount} paid courses`
                        : `Showing ${freeListingCount} free courses`}
                    </div>
                  </div>
                  <div className="w-full sm:w-64">
                    <Select value={listingFilter} onValueChange={(value) => setListingFilter(value as ListingFilter)}>
                      <SelectTrigger className="border-white/10 bg-white/[0.03] text-foreground">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#090b17] text-foreground">
                        <SelectItem value="paid">Paid Courses</SelectItem>
                        <SelectItem value="free">Free Courses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!user && !isAuthLoading ? (
                  <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          Sign in required to open provider source links
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          You can browse the full marketplace without an account, but source redirects unlock only after login or sign-up.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {filteredListings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredListings.map((listing) => (
                      <ListingRow
                        key={listing.id}
                        listing={listing}
                        user={user}
                        onRequireAuth={handleRequireAuth}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center sm:p-8">
                    <h4 className="text-lg font-semibold sm:text-xl">
                      No {listingFilter === "paid" ? "paid" : "free"} listings in this category
                    </h4>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Try switching the dropdown to {listingFilter === "paid" ? "Free Courses" : "Paid Courses"}.
                      Some providers publish only free tracks, while others expose pricing only for paid programs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={authPromptOpen} onOpenChange={setAuthPromptOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#090b17] text-foreground">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Sign in required</DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Source catalog redirects are available only to signed-in users. Log in or create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full"
              onClick={() => {
                setAuthPromptOpen(false);
                router.push("/login?callbackUrl=%2Ffeatures");
              }}
            >
              Log In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setAuthPromptOpen(false);
                router.push("/signup?callbackUrl=%2Ffeatures");
              }}
            >
              Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
