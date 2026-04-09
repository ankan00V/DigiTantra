import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_ENCLAVE_OVERVIEW_STATS, AI_ENCLAVE_SERVICE_SECTIONS } from "@/lib/ai-enclave/services";

export const metadata: Metadata = {
  title: "AI Enclave | DigiTantra",
  description: "Explore DigiTantra AI Enclave services across career, learning, content, and developer workflows.",
};

export default function AiEnclavePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_58%)]" />
      <div className="absolute inset-x-0 top-40 -z-10 h-[28rem] bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.06),transparent_62%)]" />

      <div className="main-container relative z-10 space-y-14 pt-24 sm:space-y-20 sm:pt-28">
        <section className="space-y-8 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">AI Enclave</p>
            <h1 className="mt-5 font-headline text-4xl font-bold tracking-tighter sm:text-6xl lg:text-7xl">
              A direct-use <span className="text-glow-primary text-primary">AI workspace</span> for DigiTantra users
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
              AI Enclave is where DigiTantra&apos;s practical AI utilities live. Every service now opens into its
              own dedicated workspace so users can move directly from need to output across career, learning,
              content, and developer workflows.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {AI_ENCLAVE_OVERVIEW_STATS.map((stat) => (
              <div
                key={stat.label}
                className="glassmorphic rounded-2xl px-5 py-6 text-center sm:px-6 sm:text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-3 font-headline text-3xl text-foreground sm:text-4xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          {AI_ENCLAVE_SERVICE_SECTIONS.map((section) => {
            const SectionIcon = section.icon;

            return (
              <div
                key={section.eyebrow}
                className="grid gap-8 rounded-[2rem] border border-white/5 bg-background/20 p-6 backdrop-blur-sm sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
              >
                <div className="space-y-5 text-left">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <SectionIcon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {section.eyebrow}
                    </p>
                    <h2 className="font-headline text-2xl font-semibold tracking-tight sm:text-3xl">
                      {section.title}
                    </h2>
                    <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.services.map((service) => (
                    <Card
                      key={service.name}
                      className="glassmorphic flex h-full flex-col justify-between rounded-[1.5rem] border-white/5"
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              service.status === "Live now"
                                ? "border border-secondary/30 bg-secondary/10 text-secondary"
                                : "border border-primary/20 bg-primary/10 text-primary"
                            }`}
                          >
                            {service.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="font-headline text-xl leading-tight">
                            {service.name}
                          </CardTitle>
                          <CardDescription className="text-sm leading-7 text-muted-foreground">
                            {service.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      {service.href ? (
                        <CardFooter className="pt-0">
                          <Button asChild variant="secondary" className="w-full font-semibold sm:w-auto">
                            <Link href={service.href}>
                              Launch Tool <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
