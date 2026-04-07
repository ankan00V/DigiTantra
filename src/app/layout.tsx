import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@/components/google-analytics';
import { cn } from '@/lib/utils';
import { LayoutContent } from '@/components/layout/layout-content';
import { TidioWidget } from '@/components/tidio-widget';
import AuthSessionProvider from '@/components/auth-session-provider';

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
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? '';

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <GoogleAnalytics ga_id={gaId} />
      </head>
      <body className={cn('font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <AuthSessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthSessionProvider>
        <TidioWidget />
      </body>
    </html>
  );
}

    
