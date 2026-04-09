import Link from "next/link";
import type { Metadata } from 'next';
import {
  Bot,
  Database,
  LayoutDashboard,
  Linkedin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_ENCLAVE_SERVICE_SECTIONS } from "@/lib/ai-enclave/services";
import { getCourseMarketplaceCatalog } from "@/lib/course-marketplace/server";
import type { CourseCategory, ProviderStatus } from "@/lib/course-marketplace/types";

export const metadata: Metadata = {
  title: 'Dashboard | DigiTantra',
  description: 'View a real snapshot of DigiTantra site structure, AI Enclave inventory, and course marketplace coverage.',
};

export const dynamic = "force-dynamic";

const PRIMARY_SECTIONS = [
  'Home',
  'Courses & Pricing',
  'AI Enclave',
  'Dashboard',
  'About',
  'Contact',
];

export default async function AnalyticsPage() {
  const courseMarketplaceCatalog = await getCourseMarketplaceCatalog();
  const refreshedAtMs = Date.parse(courseMarketplaceCatalog.refreshedAt);
  const minutesSinceRefresh = Number.isFinite(refreshedAtMs)
    ? Math.max(0, Math.round((Date.now() - refreshedAtMs) / (60 * 1000)))
    : null;
  const freshnessValue =
    minutesSinceRefresh === null
      ? "Unknown"
      : minutesSinceRefresh < 1
        ? "Just now"
        : `${minutesSinceRefresh}m ago`;

  const totalAiServices = AI_ENCLAVE_SERVICE_SECTIONS.reduce(
    (count, section) => count + section.services.length,
    0
  );
  const totalTrackedListings = courseMarketplaceCatalog.categories.reduce(
    (count: number, category: CourseCategory) => count + category.listings.length,
    0
  );
  const freeTrackedListings = courseMarketplaceCatalog.categories.reduce(
    (count: number, category: CourseCategory) =>
      count +
      category.listings.filter((listing) => listing.priceLabel?.toLowerCase().includes('free')).length,
    0
  );
  const paidTrackedListings = totalTrackedListings - freeTrackedListings;
  const liveProviderCount = courseMarketplaceCatalog.providers.filter(
    (provider: ProviderStatus) => provider.mode === 'live' || provider.mode === 'partial'
  ).length;
  const blockedProviderCount = courseMarketplaceCatalog.providers.filter(
    (provider: ProviderStatus) => provider.mode === 'blocked'
  ).length;
  const providersWithListingsCount = courseMarketplaceCatalog.providers.filter(
    (provider: ProviderStatus) => provider.listingCount > 0
  ).length;
  const averageListingsPerTrack =
    courseMarketplaceCatalog.categories.length > 0
      ? (totalTrackedListings / courseMarketplaceCatalog.categories.length).toFixed(1)
      : "0.0";

  const overviewStats = [
    {
      icon: <LayoutDashboard className="h-7 w-7 text-primary" />,
      label: 'Catalog Freshness',
      value: freshnessValue,
      description: 'Time since last successful marketplace scrape snapshot.',
    },
    {
      icon: <Database className="h-7 w-7 text-primary" />,
      label: 'Tracked Listings',
      value: `${totalTrackedListings}`,
      description: 'External course listings visible inside Courses & Pricing.',
    },
    {
      icon: <Bot className="h-7 w-7 text-primary" />,
      label: 'AI Enclave Tools',
      value: `${totalAiServices}`,
      description: 'Direct-use AI workspaces currently active across the app.',
    },
    {
      icon: <ShieldCheck className="h-7 w-7 text-primary" />,
      label: 'Live Providers',
      value: `${liveProviderCount}`,
      description: 'Marketplace sources currently reporting live or partial data.',
    },
  ];

  const quickStats = [
    {
      label: 'Providers With Listings',
      value: `${providersWithListingsCount}`,
      description: 'Sources currently contributing at least one tracked listing.',
    },
    {
      label: 'Free Listings',
      value: `${freeTrackedListings}`,
      description: 'Tracked free external courses across all categories.',
    },
    {
      label: 'Paid Listings',
      value: `${paidTrackedListings}`,
      description: 'Tracked paid or price-exposed external courses.',
    },
    {
      label: 'Blocked Providers',
      value: `${blockedProviderCount}`,
      description: 'Sources currently facing anti-bot or extraction limits.',
    },
    {
      label: 'Avg Listings / Track',
      value: averageListingsPerTrack,
      description: 'Mean listing volume per DigiTantra course category.',
    },
  ];

  const categoryDistribution = courseMarketplaceCatalog.categories.map((category: CourseCategory) => ({
    category: category.name,
    totalListings: category.listings.length,
    freeListings: category.listings.filter((listing) =>
      listing.priceLabel?.toLowerCase().includes('free')
    ).length,
    paidListings: category.listings.filter(
      (listing) => !(listing.priceLabel?.toLowerCase().includes('free'))
    ).length,
  }));

  const serviceDistribution = AI_ENCLAVE_SERVICE_SECTIONS.map((section) => ({
    section: section.eyebrow,
    services: section.services.length,
  }));

  const providerModeDistribution = (
    ['live', 'partial', 'blocked', 'planned'] as const
  ).map((mode) => ({
    mode: mode[0].toUpperCase() + mode.slice(1),
    providers: courseMarketplaceCatalog.providers.filter(
      (provider: ProviderStatus) => provider.mode === mode
    ).length,
  }));

  return (
    <div className="relative overflow-hidden">
      <div className="main-container relative z-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Dashboard</p>
          <h1 className="mt-4 font-headline text-4xl font-bold tracking-tighter md:text-5xl">
            DigiTantra <span className="text-glow-primary text-primary">Control Room</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            A live snapshot of DigiTantra&apos;s actual product surface: navigation structure, AI Enclave
            inventory, course marketplace coverage, and current provider health.
          </p>
        </div>

        <div className="mt-16">
          <Card className="glassmorphic overflow-hidden border-primary/35 bg-gradient-to-br from-primary/12 via-background/90 to-secondary/10 shadow-[0_0_30px_hsl(var(--primary)/0.18)] transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/25">
            <CardContent className="flex flex-col gap-8 p-8 md:flex-row md:items-center">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src="https://avatars.githubusercontent.com/u/142795534?v=4" alt="Ankan Ghosh" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h3 className="font-headline text-3xl text-primary">Founder Desk</h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  DigiTantra is being built as a practical learning ecosystem where students do not just browse
                  courses, but move from discovery to guided execution through structured tracks, AI workspaces,
                  and real product-led learning experiences.
                </p>
              </div>
              <Button asChild size="lg" className="ml-auto flex-shrink-0 font-semibold">
                <Link href="https://www.linkedin.com/in/ghoshankan/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-5 w-5" />
                  Connect on LinkedIn
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => (
            <Card key={stat.label} className="glassmorphic">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold">{stat.value}</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="glassmorphic">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <AnalyticsDashboard
          categoryDistribution={categoryDistribution}
          providerDistribution={providerModeDistribution}
          serviceDistribution={serviceDistribution}
        />

        <div className="mt-16 grid grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Site Composition</CardTitle>
              <CardDescription>
                The main product surfaces currently exposed in DigiTantra&apos;s primary navigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRIMARY_SECTIONS.map((section, index) => (
                <div
                  key={section}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-background/25 px-4 py-3"
                >
                  <span className="font-medium">{section}</span>
                  <span className="text-sm text-muted-foreground">0{index + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">What This Dashboard Actually Measures</CardTitle>
              <CardDescription>
                A truthful internal snapshot of the product as it exists right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="rounded-2xl border border-white/8 bg-background/25 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Database className="h-4 w-4 text-primary" />
                  Course marketplace coverage
                </div>
                Track counts, free vs paid listing splits, and provider health are based on the actual stored
                marketplace catalog used by the app.
              </div>
              <div className="rounded-2xl border border-white/8 bg-background/25 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Enclave inventory
                </div>
                Service counts come directly from the live AI Enclave registry, grouped into Career AI, Learning
                AI, Content AI, and Builder AI.
              </div>
              <div className="rounded-2xl border border-white/8 bg-background/25 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Product structure
                </div>
                Navigation and surface counts reflect the actual DigiTantra app sections currently visible to
                users, not generic SaaS demo analytics.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
