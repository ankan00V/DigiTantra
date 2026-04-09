'use client';

import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Loader2, MailCheck, RefreshCcw, Upload, XCircle } from 'lucide-react';

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
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().max(128, { message: 'Password is too long.' }),
  confirmPassword: z.string().optional(),
  otp: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{6}$/.test(value), {
      message: 'Enter the 6-digit OTP.',
    }),
  profileImage: z.string().nullable().optional(),
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

async function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read image.'));
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

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

export function AuthForm({ mode }: AuthFormProps) {
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<'google' | null>(null);
  const [resendCooldownRemaining, setResendCooldownRemaining] = useState(0);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);
  const hasPrefilledEmail = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshSession } = useAuthSession();
  const errorMessage = getErrorMessage(searchParams.get('error'));
  const callbackUrlParam = searchParams.get('callbackUrl');
  const callbackUrl =
    callbackUrlParam && callbackUrlParam.startsWith('/') ? callbackUrlParam : '/';
  const showRegisteredMessage = mode === 'login' && searchParams.get('registered') === '1';
  const showResetMessage = mode === 'login' && searchParams.get('reset') === '1';

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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      profileImage: null,
    },
  });

  useEffect(() => {
    if (hasPrefilledEmail.current) {
      return;
    }

    const emailParam = searchParams.get('email');

    if (!emailParam) {
      return;
    }

    const parsed = z.string().email().safeParse(emailParam);

    if (!parsed.success) {
      return;
    }

    form.setValue('email', parsed.data, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });

    hasPrefilledEmail.current = true;
  }, [form, searchParams]);

  const parseError = async (response: Response) => {
    try {
      const payload = (await response.json()) as { error?: string };
      return payload.error ?? 'Authentication failed. Please try again.';
    } catch {
      return 'Authentication failed. Please try again.';
    }
  };

  const passwordValue = form.watch('password') ?? '';
  const passwordChecks = getPasswordChecks(passwordValue);
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordScore);

  const handleProviderSignIn = async (provider: 'google') => {
    setPendingProvider(provider);
    await signIn(provider, { callbackUrl });
    setPendingProvider(null);
  };

  const validateSignupFields = async () => {
    const emailIsValid = await form.trigger('email');
    const name = (form.getValues('name') ?? '').trim();
    const password = form.getValues('password') ?? '';
    const checks = getPasswordChecks(password);
    const confirmPassword = form.getValues('confirmPassword') ?? '';
    let hasError = !emailIsValid;

    if (name.length < 2) {
      hasError = true;
      form.setError('name', {
        type: 'validate',
        message: 'Name must be at least 2 characters long.',
      });
    } else {
      form.clearErrors('name');
    }

    if (!checks.minLength) {
      hasError = true;
      form.setError('password', {
        type: 'validate',
        message: 'Password must be at least 8 characters long.',
      });
    } else if (!checks.lowercase) {
      hasError = true;
      form.setError('password', {
        type: 'validate',
        message: 'Password must include at least one lowercase letter.',
      });
    } else if (!checks.uppercase) {
      hasError = true;
      form.setError('password', {
        type: 'validate',
        message: 'Password must include at least one uppercase letter.',
      });
    } else if (!checks.number) {
      hasError = true;
      form.setError('password', {
        type: 'validate',
        message: 'Password must include at least one number.',
      });
    } else if (!checks.special) {
      hasError = true;
      form.setError('password', {
        type: 'validate',
        message: 'Password must include at least one special character.',
      });
    } else {
      form.clearErrors('password');
    }

    if (confirmPassword !== password) {
      hasError = true;
      form.setError('confirmPassword', {
        type: 'validate',
        message: 'Confirm password must match password.',
      });
    } else {
      form.clearErrors('confirmPassword');
    }

    return !hasError;
  };

  const loginWithPassword = async (values: AuthFormValues) => {
    const emailIsValid = await form.trigger('email');
    if (!emailIsValid) {
      return;
    }

    if (!values.password) {
      form.setError('password', {
        type: 'validate',
        message: 'Password is required.',
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/email-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await refreshSession();
      toast({
        title: 'Welcome Back',
        description: 'You have been logged in successfully.',
      });
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const requestSignupOtp = async () => {
    const fieldsAreValid = await validateSignupFields();

    if (!fieldsAreValid) {
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
          mode: 'signup',
          signup: {
            name: form.getValues('name'),
            password: form.getValues('password'),
            image: form.getValues('profileImage'),
          },
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
          'A 6-digit OTP has been sent to your email. Enter it below to finish sign up.',
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

  const verifySignupOtp = async (values: AuthFormValues) => {
    if (!values.otp) {
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
          email: values.email,
          otp: values.otp,
          mode: 'signup',
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const params = new URLSearchParams({
        email: values.email,
        registered: '1',
      });

      if (callbackUrl !== '/') {
        params.set('callbackUrl', callbackUrl);
      }

      toast({
        title: 'Account Created',
        description: 'Sign up complete. Log in with your email and password.',
      });

      router.push(`/login?${params.toString()}`);
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

  const resetSignupOtpState = () => {
    setHasSentOtp(false);
    setResendCooldownRemaining(0);
    form.setValue('otp', '');
  };

  const handleProfilePhotoSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      form.setError('profileImage', {
        type: 'validate',
        message: 'Please select an image file.',
      });
      event.target.value = '';
      return;
    }

    if (file.size > 1_500_000) {
      form.setError('profileImage', {
        type: 'validate',
        message: 'Profile photo must be 1.5 MB or smaller.',
      });
      event.target.value = '';
      return;
    }

    setIsReadingPhoto(true);

    try {
      const dataUrl = await readImageAsDataUrl(file);
      form.setValue('profileImage', dataUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.clearErrors('profileImage');
      setSelectedPhotoName(file.name);
    } catch {
      form.setError('profileImage', {
        type: 'validate',
        message: 'Unable to read selected image.',
      });
      event.target.value = '';
    } finally {
      setIsReadingPhoto(false);
    }
  };

  const clearSelectedProfilePhoto = () => {
    setSelectedPhotoName(null);
    form.setValue('profileImage', null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.clearErrors('profileImage');
  };

  const onSubmit = async (data: AuthFormValues) => {
    if (mode === 'login') {
      await loginWithPassword(data);
      return;
    }

    if (!hasSentOtp) {
      await requestSignupOtp();
      return;
    }

    await verifySignupOtp(data);
  };

  const isBusy =
    pendingProvider !== null ||
    isRequestingOtp ||
    isVerifyingOtp ||
    isLoggingIn ||
    isReadingPhoto;
  const passwordStrengthTone =
    passwordScore <= 1
      ? 'text-destructive'
      : passwordScore <= 3
        ? 'text-amber-400'
        : passwordScore === 4
          ? 'text-yellow-300'
          : 'text-emerald-400';
  const passwordStrengthWidth = `${(passwordScore / 5) * 100}%`;

  const profileImage = form.watch('profileImage');

  return (
    <Card className="glassmorphic">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="font-headline text-2xl sm:text-3xl">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Log in with your email and password, or continue with Google.'
            : 'Sign up with name, email, password, and OTP verification.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {showRegisteredMessage ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            Sign up completed. Enter your email and password to log in.
          </div>
        ) : null}

        {showResetMessage ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            Password reset completed. Log in with your new password.
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' ? (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        value={field.value ?? ''}
                        disabled={isBusy || hasSentOtp}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

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
                      disabled={isBusy || (mode === 'signup' && hasSentOtp)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder={mode === 'login' ? 'Enter password' : 'Create a password'}
                      {...field}
                      value={field.value ?? ''}
                      disabled={isBusy || (mode === 'signup' && hasSentOtp)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'signup' ? (
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
            ) : null}

            {mode === 'signup' ? (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        {...field}
                        value={field.value ?? ''}
                        disabled={isBusy || hasSentOtp}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {mode === 'signup' ? (
              <div className="space-y-2">
                <FormLabel className="block">Profile Photo (Optional)</FormLabel>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-foreground hover:bg-white/10">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleProfilePhotoSelection}
                        disabled={isBusy || hasSentOtp}
                      />
                    </label>
                    {profileImage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedProfilePhoto}
                        disabled={isBusy || hasSentOtp}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                    {selectedPhotoName ? (
                      <span className="max-w-[14rem] truncate text-xs text-muted-foreground">
                        {selectedPhotoName}
                      </span>
                    ) : null}
                  </div>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Selected profile preview"
                      className="mt-3 h-20 w-20 rounded-full border border-border/80 object-cover"
                    />
                  ) : null}
                </div>
                {form.formState.errors.profileImage ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.profileImage.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            {mode === 'signup' && hasSentOtp ? (
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

            {mode === 'signup' && hasSentOtp ? (
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
                {isRequestingOtp || isVerifyingOtp || isLoggingIn || isReadingPhoto ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {mode === 'login'
                  ? 'Log In with Email'
                  : hasSentOtp
                    ? 'Verify OTP and Create Account'
                    : 'Send Sign-up OTP'}
              </Button>

              {mode === 'signup' && hasSentOtp ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isBusy || resendCooldownRemaining > 0}
                    onClick={requestSignupOtp}
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
                    onClick={resetSignupOtpState}
                  >
                    Edit signup details
                  </Button>
                </div>
              ) : null}

              {mode === 'login' ? (
                <div className="text-right text-sm">
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(form.getValues('email') ?? '')}`}
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
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
          Signup now uses secure password + OTP verification, while login uses email and password.
        </p>
      </CardContent>
    </Card>
  );
}
