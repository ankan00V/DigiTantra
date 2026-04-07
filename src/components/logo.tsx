import { useId } from 'react';
import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  const gradientId = `digitantra-logo-gradient-${useId().replace(/:/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="130"
      height="30"
      aria-label="DigiTantra Logo"
      className={cn('overflow-visible text-primary', className)}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" />
          <stop offset="38%" stopColor="hsl(var(--primary))" />
          <stop offset="72%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.92)" />
        </linearGradient>
      </defs>
      <text
        className="font-headline"
        x="0"
        y="40"
        fontSize="40"
        fontWeight="bold"
        fill={`url(#${gradientId})`}
        style={{
          filter:
            'drop-shadow(0 0 14px hsl(var(--primary) / 0.32)) drop-shadow(0 0 20px hsl(var(--secondary) / 0.12))',
        }}
      >
        DigiTantra
      </text>
    </svg>
  );
}
