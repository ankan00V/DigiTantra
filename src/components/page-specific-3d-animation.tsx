'use client';

import { usePathname } from 'next/navigation';

type AnimationType = 'home' | 'about' | 'features' | 'analytics' | 'contact' | 'social' | 'blog' | 'auth';

const animationMap: Record<string, AnimationType> = {
  '/': 'home',
  '/about': 'about',
  '/social': 'social',
  '/blog': 'blog',
  '/signup': 'auth',
  '/login': 'auth',
};

const pageSpecificAnimations: Record<string, AnimationType> = {
  '/contact': 'contact',
  '/features': 'contact',
  '/analytics': 'contact',
  '/ai-enclave': 'contact',
};

const paletteMap: Record<AnimationType, string[]> = {
  home: ['from-primary/18', 'via-secondary/12', 'to-primary/6'],
  about: ['from-primary/14', 'via-emerald-400/8', 'to-secondary/10'],
  features: ['from-primary/18', 'via-cyan-400/10', 'to-secondary/8'],
  analytics: ['from-secondary/16', 'via-primary/10', 'to-cyan-300/8'],
  contact: ['from-primary/20', 'via-secondary/12', 'to-primary/8'],
  social: ['from-fuchsia-400/12', 'via-primary/12', 'to-secondary/8'],
  blog: ['from-primary/14', 'via-amber-300/8', 'to-secondary/8'],
  auth: ['from-primary/16', 'via-secondary/14', 'to-primary/10'],
};

const orbMap: Record<AnimationType, string[]> = {
  home: ['bg-primary/16', 'bg-secondary/12', 'bg-primary/10'],
  about: ['bg-primary/12', 'bg-emerald-300/10', 'bg-secondary/10'],
  features: ['bg-primary/16', 'bg-cyan-300/10', 'bg-secondary/8'],
  analytics: ['bg-secondary/14', 'bg-primary/10', 'bg-cyan-300/10'],
  contact: ['bg-primary/18', 'bg-secondary/12', 'bg-primary/10'],
  social: ['bg-fuchsia-400/12', 'bg-primary/12', 'bg-secondary/8'],
  blog: ['bg-primary/12', 'bg-amber-300/10', 'bg-secondary/8'],
  auth: ['bg-primary/14', 'bg-secondary/12', 'bg-primary/10'],
};

function DecorativeField({ type }: { type: AnimationType }) {
  const [fromClass, viaClass, toClass] = paletteMap[type];
  const [orbA, orbB, orbC] = orbMap[type];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,70,255,0.18),transparent_48%),linear-gradient(180deg,rgba(4,7,20,0.18),transparent_30%,rgba(4,7,20,0.32))]" />
      <div className={`absolute inset-x-[-10%] top-[-18%] h-[40rem] rounded-full bg-gradient-to-b ${fromClass} blur-3xl`} />
      <div className={`absolute right-[-12%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-b ${viaClass} blur-3xl animate-[pulse_7s_ease-in-out_infinite]`} />
      <div className={`absolute bottom-[-12%] left-[-6%] h-[24rem] w-[24rem] rounded-full bg-gradient-to-b ${toClass} blur-3xl animate-[pulse_8s_ease-in-out_infinite]`} />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0,transparent_1.4px)] [background-size:32px_32px]" />
      <div className={`absolute left-[8%] top-[16%] h-28 w-28 rounded-full ${orbA} blur-2xl animate-pulse`} />
      <div className={`absolute right-[12%] top-[28%] h-40 w-40 rounded-full ${orbB} blur-3xl animate-pulse`} />
      <div className={`absolute bottom-[12%] left-[18%] h-32 w-32 rounded-full ${orbC} blur-2xl animate-pulse`} />
      <div className="absolute inset-x-0 top-[12%] h-px bg-gradient-to-r from-transparent via-primary/28 to-transparent" />
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-gradient-to-r from-transparent via-secondary/18 to-transparent" />
    </div>
  );
}

export function PageSpecific3DAnimation({ type: propType }: { type?: AnimationType }) {
  const pathname = usePathname();
  const pageSpecificType =
    pageSpecificAnimations[pathname] ??
    (pathname.startsWith('/ai-enclave/') ? 'contact' : undefined);
  const type = propType || pageSpecificType || animationMap[pathname];
  const isPageSpecific = !!pageSpecificType || propType === 'contact';

  if (!type || type === 'home') {
    return null;
  }

  return (
    <div
      className={
        isPageSpecific
          ? 'fixed inset-0 z-0 pointer-events-none'
          : 'fixed inset-0 z-0 pointer-events-none opacity-30'
      }
      aria-hidden="true"
    >
      <DecorativeField type={type} />
    </div>
  );
}
