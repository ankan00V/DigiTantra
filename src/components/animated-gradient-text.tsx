import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient",
        className
      )}
      style={{
        animation: "gradient 2s linear infinite",
        '@keyframes gradient': {
          'to': { backgroundPosition: '200% center' },
        },
      } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
