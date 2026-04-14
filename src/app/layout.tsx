import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/google-analytics';
import { LayoutContent } from '@/components/layout/layout-content';
import { TidioWidget } from '@/components/tidio-widget';
import AuthSessionProvider from '@/components/auth-session-provider';

export const metadata: Metadata = {
  title: 'DigiTantra — The Future of Tech Education',
  description: 'A modern, data-driven, and visually stunning website for learning tech skills.',
  keywords: ['digital marketing', 'SEO', 'analytics', 'AI tools', 'modern marketing'],
  verification: {
    google: 'ZkGGYJIeoDcie1mBEBJch4ilq7pPtuVBDYa4apwYdRU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-G8EFXCN3EK';

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <GoogleAnalytics ga_id={gaId} />
      </head>
      <body className="font-body antialiased">
        <AuthSessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthSessionProvider>
        <TidioWidget />
      </body>
    </html>
  );
}

    
