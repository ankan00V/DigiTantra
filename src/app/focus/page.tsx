import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Focus Timer | DigiTantra",
  description:
    "Use VibeFocus — an aesthetic deep-work timer — to stay in flow while learning on DigiTantra.",
};

const VIBE_FOCUS_URL = "https://vibe-focus-three.vercel.app";

export default function FocusPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="main-container relative z-10 space-y-8 pt-24 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Focus Mode
          </p>
          <h1 className="mt-5 font-headline text-4xl font-bold tracking-tighter sm:text-6xl">
            VibeFocus <span className="text-glow-primary text-primary">Timer</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-muted-foreground sm:text-lg">
            An aesthetic timer built for deep work and mindful study sessions. Use it alongside your
            learning track, notes, or AI Enclave workflows.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="font-semibold">
              <Link href={VIBE_FOCUS_URL} target="_blank" rel="noopener noreferrer">
                Open VibeFocus <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link href="/ai-enclave">Back to AI Enclave</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-background/20 shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <div className="border-b border-white/10 px-5 py-4 text-sm text-muted-foreground sm:px-6">
            Embedded preview (if your browser blocks embedding, use “Open VibeFocus” above).
          </div>
          <div className="relative h-[78vh] min-h-[620px] w-full">
            <iframe
              title="VibeFocus Timer"
              src={VIBE_FOCUS_URL}
              className="absolute inset-0 h-full w-full"
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

