import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {ArrowLeft, ArrowRight, Sparkles} from 'lucide-react';

import {AiEnclaveServiceWorkbench} from '@/components/ai-enclave-service-workbench';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {getAiEnclaveService, type AiEnclaveServiceId} from '@/lib/ai-enclave/services';
import {getAiEnclaveWorkbenchConfig} from '@/lib/ai-enclave/workbench';

type AiEnclaveServicePageProps = {
  params: {
    serviceId: string;
  };
};

function getServicePageData(serviceId: string) {
  try {
    const service = getAiEnclaveService(serviceId as AiEnclaveServiceId);
    const workbench = getAiEnclaveWorkbenchConfig(service.id);
    return {service, workbench};
  } catch {
    return null;
  }
}

export function generateMetadata({params}: AiEnclaveServicePageProps): Metadata {
  const pageData = getServicePageData(params.serviceId);

  if (!pageData) {
    return {
      title: 'AI Service | DigiTantra',
    };
  }

  return {
    title: `${pageData.service.name} | DigiTantra`,
    description: pageData.service.description,
  };
}

export default function AiEnclaveServicePage({params}: AiEnclaveServicePageProps) {
  const pageData = getServicePageData(params.serviceId);

  if (!pageData) {
    notFound();
  }

  const {service, workbench} = pageData;

  if (service.id === 'blog-generator') {
    redirect('/blog');
  }

  if (!workbench) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_56%)]" />

      <div className="main-container relative z-10 space-y-12 pt-24 sm:space-y-16 sm:pt-28">
        <div className="space-y-6">
          <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-primary">
            <Link href="/ai-enclave">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Enclave
            </Link>
          </Button>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Enclave Service
            </div>
            <h1 className="max-w-4xl font-headline text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
              {service.name}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              {service.description}
            </p>
          </div>
        </div>

        <AiEnclaveServiceWorkbench
          fields={workbench.fields}
          helperPoints={workbench.helperPoints}
          intro={workbench.intro}
          service={service}
          submitLabel={workbench.ctaLabel}
          title={workbench.title}
        />

        <Card className="glassmorphic rounded-[1.75rem] border-primary/10">
          <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="font-headline text-2xl">Need another AI tool?</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Jump back to the AI Enclave overview and launch another dedicated service workspace.
              </p>
            </div>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/ai-enclave">
                Explore All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
