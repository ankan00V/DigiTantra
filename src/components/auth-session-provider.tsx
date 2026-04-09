'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { SessionProvider, signOut, useSession } from 'next-auth/react';

type EmailOtpUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: 'email-password' | 'google-oauth';
  emailVerifiedAt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export default function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}

export function useAuthSession() {
  const { data, status, update } = useSession();
  const [emailOtpUser, setEmailOtpUser] = useState<EmailOtpUser | null>(null);
  const [isEmailOtpLoading, setIsEmailOtpLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadEmailOtpSession = async () => {
      try {
        const response = await fetch('/api/email-auth/session', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Unable to read email auth session.');
        }

        const payload = (await response.json()) as {
          user: EmailOtpUser | null;
        };

        if (isMounted) {
          setEmailOtpUser(payload.user);
        }
      } catch (error) {
        console.error('email auth session load failed', error);
        if (isMounted) {
          setEmailOtpUser(null);
        }
      } finally {
        if (isMounted) {
          setIsEmailOtpLoading(false);
        }
      }
    };

    void loadEmailOtpSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const nextAuthUser = data?.user ?? null;
  const primaryUser =
    nextAuthUser && emailOtpUser && nextAuthUser.email === emailOtpUser.email
      ? {
          ...nextAuthUser,
          name: emailOtpUser.name ?? nextAuthUser.name,
          image: emailOtpUser.image ?? nextAuthUser.image,
        }
      : nextAuthUser ?? emailOtpUser ?? null;
  const isLoading = status === 'loading' || isEmailOtpLoading;

  return useMemo(
    () => ({
      user: primaryUser,
      isLoading,
      refreshSession: async (profileUpdates?: { name?: string; image?: string | null }) => {
        const nextSession = await update(profileUpdates);

        try {
          const response = await fetch('/api/email-auth/session', {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
          });

          if (response.ok) {
            const payload = (await response.json()) as {
              user: EmailOtpUser | null;
            };
            setEmailOtpUser(payload.user);

            if (!nextSession?.user && payload.user) {
              return payload.user;
            }
          }
        } catch (error) {
          console.error('email auth session refresh failed', error);
        }

        return nextSession?.user ?? null;
      },
      logout: async () => {
        await Promise.allSettled([
          signOut({
            redirect: false,
            callbackUrl: '/',
          }),
          fetch('/api/email-auth/logout', {
            method: 'POST',
            credentials: 'same-origin',
          }),
        ]);

        setEmailOtpUser(null);
      },
    }),
    [primaryUser, isLoading, update]
  );
}
