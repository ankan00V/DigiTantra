'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Loader2, MailCheck, RefreshCcw } from 'lucide-react';

import { useAuthSession } from '@/components/auth-session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  otp: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{6}$/.test(value), {
      message: 'Enter the 6-digit OTP.',
    }),
});

type AuthFormValues = z.infer<typeof formSchema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.5-.2-2.2H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.5 0 4.7-.8 6.2-2.2l-3.1-2.4c-.9.6-2 .9-3.2.9-2.4 0-4.5-1.6-5.2-3.8l-3.2 2.5A9.4 9.4 0 0 0 12 21Z"
      />
      <path
        fill="#4A90E2"
        d="M3.5 16l3.2-2.5A5.7 5.7 0 0 1 6.4 12c0-.5.1-1 .3-1.5L3.5 8A9.4 9.4 0 0 0 2.5 12c0 1.5.4 2.9 1 4Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.7c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 12 3 9.4 9.4 0 0 0 3.5 8l3.2 2.5c.7-2.2 2.8-3.8 5.3-3.8Z"
      />
    </svg>
  );
}

function getErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to another provider. Use the original login method for that account.';
    case 'AccessDenied':
      return 'The provider denied access. Please choose an account and try again.';
    default:
      return errorCode ? 'Authentication failed. Please try again.' : null;
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<'google' | null>(null);
  const [resendCooldownRemaining, setResendCooldownRemaining] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshSession } = useAuthSession();
  const errorMessage = getErrorMessage(searchParams.get('error'));
  const callbackUrlParam = searchParams.get('callbackUrl');
  const callbackUrl =
    callbackUrlParam && callbackUrlParam.startsWith('/') ? callbackUrlParam : '/';

  useEffect(() => {
    if (resendCooldownRemaining <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCooldownRemaining]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  });

  const parseError = async (response: Response) => {
    try {
      const payload = (await response.json()) as { error?: string };
      return payload.error ?? 'Authentication failed. Please try again.';
    } catch {
      return 'Authentication failed. Please try again.';
    }
  };

  const handleProviderSignIn = async (provider: 'google') => {
    setPendingProvider(provider);
    await signIn(provider, { callbackUrl });
    setPendingProvider(null);
  };

  const requestOtp = async () => {
    const emailIsValid = await form.trigger('email');

    if (!emailIsValid) {
      return;
    }

    setIsRequestingOtp(true);

    try {
      const response = await fetch('/api/email-auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: form.getValues('email'),
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setHasSentOtp(true);
      setResendCooldownRemaining(30);
      toast({
        title: 'Verification Code Sent',
        description:
          'A 6-digit OTP has been sent to your email. Enter it below to continue.',
      });
      form.setFocus('otp');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Unable to Send OTP',
        description:
          error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const resetOtpState = () => {
    setHasSentOtp(false);
    setResendCooldownRemaining(0);
    form.setValue('otp', '');
  };

  const onSubmit = async (data: AuthFormValues) => {
    if (!hasSentOtp) {
      await requestOtp();
      return;
    }

    if (!data.otp) {
      form.setError('otp', { message: 'Enter the 6-digit OTP.' });
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await fetch('/api/email-auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await refreshSession();
      toast({
        title: mode === 'signup' ? 'Account Created' : 'Welcome Back',
        description:
          mode === 'signup'
            ? 'Your DigiTantra account is now active.'
            : 'You have been logged in successfully.',
      });
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'OTP Verification Failed',
        description:
          error instanceof Error ? error.message : 'Please verify the OTP and try again.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isBusy = pendingProvider !== null || isRequestingOtp || isVerifyingOtp;

  return (
    <Card className="glassmorphic">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="font-headline text-2xl sm:text-3xl">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Use email OTP or continue with Google to access DigiTantra.'
            : 'Create your DigiTantra account with email OTP or Google.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      disabled={isBusy || hasSentOtp}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasSentOtp ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <MailCheck className="h-4 w-4 text-primary" />
                  Check your inbox
                </div>
                <p className="mt-1">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-semibold text-foreground">
                    {form.getValues('email')}
                  </span>
                  . It stays valid for 10 minutes.
                </p>
              </div>
            ) : null}

            {hasSentOtp ? (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        maxLength={6}
                        disabled={isVerifyingOtp}
                        className="text-center text-lg tracking-[0.35em]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="space-y-3">
              <Button type="submit" className="w-full font-semibold" disabled={isBusy}>
                {isRequestingOtp || isVerifyingOtp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {hasSentOtp
                  ? mode === 'login'
                    ? 'Verify OTP and Log In'
                    : 'Verify OTP and Create Account'
                  : mode === 'login'
                    ? 'Send Login OTP'
                    : 'Send Sign-up OTP'}
              </Button>

              {hasSentOtp ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isBusy || resendCooldownRemaining > 0}
                    onClick={requestOtp}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {resendCooldownRemaining > 0
                      ? `Resend OTP in ${resendCooldownRemaining}s`
                      : 'Resend OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={isBusy}
                    onClick={resetOtpState}
                  >
                    Use another email
                  </Button>
                </div>
              ) : null}
            </div>
          </form>
        </Form>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Or continue with Google
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-14 w-full justify-between rounded-2xl border-white/10 bg-white/5 px-4 text-left hover:bg-white/10',
            pendingProvider === 'google' && 'border-primary/40 bg-primary/10'
          )}
          disabled={isBusy}
          onClick={() => handleProviderSignIn('google')}
        >
          <span className="flex items-center gap-3">
            {pendingProvider === 'google' ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <GoogleIcon />
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-foreground">
                {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
              <span className="text-xs text-muted-foreground">
                Fast access with your Google account
              </span>
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Button>

        <p className="px-1 text-xs leading-6 text-muted-foreground">
          Email OTP works with any valid inbox once SMTP is configured, and Google remains available as the direct social sign-in option.
        </p>
      </CardContent>
    </Card>
  );
}
