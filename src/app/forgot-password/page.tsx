'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MailCheck, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordStrengthLabel(score: number) {
  if (score <= 1) {
    return 'Weak';
  }

  if (score <= 3) {
    return 'Fair';
  }

  if (score === 4) {
    return 'Good';
  }

  return 'Strong';
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [resendCooldownRemaining, setResendCooldownRemaining] = useState(0);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const hasPrefilledEmail = useRef(false);

  useEffect(() => {
    if (hasPrefilledEmail.current) {
      return;
    }

    const emailParam = searchParams.get('email');

    if (!emailParam) {
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailParam)) {
      return;
    }

    setEmail(emailParam);
    hasPrefilledEmail.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldownRemaining <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCooldownRemaining]);

  const parseError = async (response: Response) => {
    try {
      const payload = (await response.json()) as { error?: string };
      return payload.error ?? 'Authentication failed. Please try again.';
    } catch {
      return 'Authentication failed. Please try again.';
    }
  };

  const requestOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setIsRequestingOtp(true);

    try {
      const response = await fetch('/api/email-auth/password-reset/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setHasSentOtp(true);
      setResendCooldownRemaining(30);
      toast({
        title: 'Reset OTP Sent',
        description: 'A 6-digit reset code was sent to your email.',
      });
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

  const submitReset = async () => {
    if (!hasSentOtp) {
      await requestOtp();
      return;
    }

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Enter the 6-digit OTP sent to your email.',
      });
      return;
    }

    const passwordChecks = getPasswordChecks(password);
    if (!Object.values(passwordChecks).every(Boolean)) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description:
          'Password must have 8+ chars, uppercase, lowercase, number, and special character.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Confirm password must match password.',
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      const response = await fetch('/api/email-auth/password-reset/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
          otp,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      toast({
        title: 'Password Reset Successful',
        description: 'You can now log in with your new password.',
      });
      router.push(`/login?email=${encodeURIComponent(email)}&reset=1`);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description:
          error instanceof Error ? error.message : 'Please verify details and try again.',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const resetBusy = isRequestingOtp || isResettingPassword;
  const passwordChecks = getPasswordChecks(password);
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordScore);
  const passwordStrengthTone =
    passwordScore <= 1
      ? 'text-destructive'
      : passwordScore <= 3
        ? 'text-amber-400'
        : passwordScore === 4
          ? 'text-yellow-300'
          : 'text-emerald-400';
  const passwordStrengthWidth = `${(passwordScore / 5) * 100}%`;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="main-container relative z-10 flex min-h-[100svh] flex-col items-center justify-center py-24 sm:min-h-screen">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Reset <span className="text-glow-primary text-primary">Password</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Request an OTP and set a new password for your DigiTantra account.
          </p>
        </div>

        <Card className="glassmorphic w-full max-w-md">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-headline text-2xl sm:text-3xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your account email. We will send a secure OTP to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={resetBusy || hasSentOtp}
              />
            </div>

            {hasSentOtp ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <MailCheck className="h-4 w-4 text-primary" />
                  Check your inbox
                </div>
                <p className="mt-1">
                  We sent a 6-digit reset code to{' '}
                  <span className="font-semibold text-foreground">{email}</span>.
                </p>
              </div>
            ) : null}

            {hasSentOtp ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OTP</label>
                  <Input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    disabled={isResettingPassword}
                    className="text-center text-lg tracking-[0.35em]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create new password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isResettingPassword}
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-border/70 bg-background/40 px-4 py-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password Strength</span>
                    <span className={cn('font-semibold', passwordStrengthTone)}>
                      {passwordStrengthLabel}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        passwordScore <= 1
                          ? 'bg-destructive'
                          : passwordScore <= 3
                            ? 'bg-amber-400'
                            : passwordScore === 4
                              ? 'bg-yellow-300'
                              : 'bg-emerald-400'
                      )}
                      style={{ width: passwordStrengthWidth }}
                    />
                  </div>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <li className={passwordChecks.minLength ? 'text-emerald-400' : undefined}>
                      8+ characters
                    </li>
                    <li className={passwordChecks.uppercase ? 'text-emerald-400' : undefined}>
                      1 uppercase letter
                    </li>
                    <li className={passwordChecks.lowercase ? 'text-emerald-400' : undefined}>
                      1 lowercase letter
                    </li>
                    <li className={passwordChecks.number ? 'text-emerald-400' : undefined}>
                      1 number
                    </li>
                    <li className={passwordChecks.special ? 'text-emerald-400' : undefined}>
                      1 special character
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isResettingPassword}
                  />
                </div>
              </>
            ) : null}

            <div className="space-y-3">
              <Button type="button" className="w-full font-semibold" disabled={resetBusy} onClick={submitReset}>
                {resetBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {hasSentOtp ? 'Verify OTP and Reset Password' : 'Send Reset OTP'}
              </Button>

              {hasSentOtp ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={resetBusy || resendCooldownRemaining > 0}
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
                    disabled={resetBusy}
                    onClick={() => {
                      setHasSentOtp(false);
                      setOtp('');
                      setPassword('');
                      setConfirmPassword('');
                      setResendCooldownRemaining(0);
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              ) : null}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
