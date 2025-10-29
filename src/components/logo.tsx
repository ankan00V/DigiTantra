import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="100"
      height="25"
      aria-label="DigMkt Logo"
      {...props}
    >
      <text
        className="font-headline"
        x="0"
        y="40"
        fontSize="40"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        DigMkt
      </text>
    </svg>
  );
}
