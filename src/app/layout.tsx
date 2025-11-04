import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ScrollProgress } from '@/components/layout/scroll-progress';
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper';
import { GoogleAnalytics } from '@/components/google-analytics';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';

const fontBody = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});


export const metadata: Metadata = {
  title: 'DigiTantra — The Future of Tech Education',
  description: 'A modern, data-driven, and visually stunning website for learning tech skills.',
  keywords: ['digital marketing', 'SEO', 'analytics', 'AI tools', 'modern marketing'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
      </head>
      <body className={cn('font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <FirebaseClientProvider>
          <PageTransitionWrapper>
            <PageSpecific3DAnimation />
            <ScrollProgress />
            <Header />
            <main className="min-h-screen relative z-10">
              {children}
            </main>
            <Footer />
          </PageTransitionWrapper>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
