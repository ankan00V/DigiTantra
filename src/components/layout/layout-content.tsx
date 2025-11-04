
'use client';

import { usePathname } from 'next/navigation';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper';
import { ScrollProgress } from '@/components/layout/scroll-progress';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';

  return (
    <>
      <PageSpecific3DAnimation type={isContactPage ? 'contact' : undefined} />
      <PageTransitionWrapper>
        <ScrollProgress />
        <Header />
        <main className="min-h-screen relative z-10">
          {children}
        </main>
        <Footer />
      </PageTransitionWrapper>
      <Toaster />
    </>
  );
}
