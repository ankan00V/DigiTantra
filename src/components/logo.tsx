import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="130"
      height="30"
      aria-label="DigiTantra Logo"
      {...props}
    >
      <text
        className="font-headline"
        x="0"
        y="40"
        fontSize="40"
        fontWeight="bold"
        fill="url(#logo-gradient)"
      >
        DigiTantra
      </text>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="100%" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" />
        </linearGradient>
      </defs>
    </svg>
  );
}
