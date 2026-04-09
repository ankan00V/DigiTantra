'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {startTransition, useState} from 'react';
import {Check, Copy, Loader2, Sparkles} from 'lucide-react';

import {useAuthSession} from '@/components/auth-session-provider';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import type {AiEnclaveService} from '@/lib/ai-enclave/services';
import type {AiEnclaveFieldConfig} from '@/lib/ai-enclave/workbench';

type RunAiEnclaveServiceOutput = {
  title: string;
  content: string;
};

type AiEnclaveServiceWorkbenchProps = {
  fields: AiEnclaveFieldConfig[];
  helperPoints: string[];
  intro: string;
  service: AiEnclaveService;
  submitLabel: string;
  title: string;
};

function getEmptyValues(fields: AiEnclaveFieldConfig[]) {
  return Object.fromEntries(fields.map((field) => [field.name, '']));
}

function getDemoValues(fields: AiEnclaveFieldConfig[]) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue]));
}

export function AiEnclaveServiceWorkbench({
  fields,
  helperPoints,
  intro,
  service,
  submitLabel,
  title,
}: AiEnclaveServiceWorkbenchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {user, isLoading: isAuthLoading} = useAuthSession();
  const [seedValues, setSeedValues] = useState<Record<string, string>>(() => getEmptyValues(fields));
  const [formVersion, setFormVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunAiEnclaveServiceOutput | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const applySeedValues = (nextValues: Record<string, string>) => {
    setSeedValues(nextValues);
    setFormVersion((current) => current + 1);
  };

  const handleCopyResult = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.content);
      setCopyState('success');
      window.setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    } catch {
      setCopyState('error');
      window.setTimeout(() => {
        setCopyState('idle');
      }, 2500);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError('Please log in or sign up to use this AI service.');
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopyState('idle');
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      fields.map((field) => [field.name, (formData.get(field.name) ?? '').toString()])
    );

    startTransition(async () => {
      try {
        const response = await fetch('/api/ai-enclave/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: service.id,
            values,
          }),
        });

        const payload = (await response.json()) as
          | RunAiEnclaveServiceOutput
          | {error?: string; message?: string};

        if (!response.ok) {
          const apiMessage =
            typeof (payload as {message?: string}).message === 'string'
              ? (payload as {message: string}).message
              : typeof (payload as {error?: string}).error === 'string'
              ? (payload as {error: string}).error
              : 'This AI service could not generate a result right now. Please try again in a moment.';
          throw new Error(apiMessage);
        }

        setResult(payload as RunAiEnclaveServiceOutput);
      } catch (submitError) {
        const rawMessage =
          submitError instanceof Error
            ? submitError.message
            : 'This AI service could not generate a result right now. Please try again in a moment.';

        if (/Missing AI_ENCLAVE_(CHAT|COMPLEX)_API_KEY/i.test(rawMessage)) {
          setError('AI service configuration is missing on the server. Please update environment variables.');
          return;
        }

        if (/An error occurred in the Server Components render|digest property is included/i.test(rawMessage)) {
          setError('This AI service is temporarily unavailable. Please try again in a few minutes.');
          return;
        }

        setError(rawMessage);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
      <Card className="glassmorphic rounded-[1.75rem] border-primary/10">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Dedicated Workspace
          </div>
          <div className="space-y-2">
            <CardTitle className="font-headline text-3xl">{title}</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {intro}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {!user && !isAuthLoading ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Sign in required to run {service.name}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    You can explore this workspace freely, but generating outputs is available only after you log in or create an account.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="sm">
                    <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>Log in to continue</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`}>Create account</Link>
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-background/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                Start with your own inputs, or load a demo example to see how this tool works.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => applySeedValues(getDemoValues(fields))}
                  disabled={isLoading || !user}
                  className="flex-1 sm:flex-none"
                >
                  Use Demo Input
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applySeedValues(getEmptyValues(fields))}
                  disabled={isLoading || !user}
                  className="flex-1 sm:flex-none"
                >
                  Clear
                </Button>
              </div>
            </div>
            {fields.map((field) => (
              <div key={`${field.name}-${formVersion}`} className="space-y-2">
                <label className="text-sm font-medium text-foreground">{field.label}</label>
                {field.type === 'textarea' ? (
                  <Textarea
                    name={field.name}
                    rows={field.rows ?? 6}
                    defaultValue={seedValues[field.name] ?? ''}
                    placeholder={field.placeholder}
                    disabled={isLoading || !user}
                    className="min-h-[120px]"
                  />
                ) : (
                  <Input
                    name={field.name}
                    defaultValue={seedValues[field.name] ?? ''}
                    placeholder={field.placeholder}
                    disabled={isLoading || !user}
                  />
                )}
                <p className="text-xs leading-5 text-muted-foreground">
                  Demo example: {field.defaultValue}
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={isLoading || !user} size="lg" className="w-full font-semibold sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </>
              ) : (
                user ? submitLabel : 'Log in to use this tool'
              )}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="glassmorphic rounded-[1.75rem] border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">What This Tool Delivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {helperPoints.map((point) => (
              <div key={point} className="rounded-2xl border border-white/5 bg-background/35 px-4 py-3">
                {point}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glassmorphic rounded-[1.75rem] border-primary/10">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-2xl">
                  {result ? result.title : 'Generated Output'}
                </CardTitle>
                <CardDescription>
                  {isLoading
                    ? 'Generating a fresh service response now.'
                    : result
                    ? 'Your result is ready below.'
                    : 'Submit the form to generate a service-specific output with this tool.'}
                </CardDescription>
              </div>
              {result ? (
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyResult}
                    className="w-full gap-2 sm:w-auto"
                  >
                    {copyState === 'success' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copyState === 'success' ? 'Copied' : 'Copy Output'}
                  </Button>
                  {copyState === 'error' ? (
                    <p className="text-xs text-destructive">Copy failed. Please try again.</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-background/30 px-5 py-10 text-sm leading-7 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generating a fresh response for {service.name}.
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">
                {result.content}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-background/30 px-5 py-10 text-sm leading-7 text-muted-foreground">
                {user
                  ? `This panel will show the generated result for ${service.name} once you run the tool.`
                  : `Log in or sign up to generate a result for ${service.name}.`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
