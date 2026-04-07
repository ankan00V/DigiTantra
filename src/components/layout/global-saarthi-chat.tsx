'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircleMore, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getAiEnclaveService, type AiEnclaveServiceId } from '@/lib/ai-enclave/services';
import { cn } from '@/lib/utils';

const Chatbot = dynamic(() => import('@/components/chatbot').then((mod) => mod.Chatbot), {
  ssr: false,
});

type PageChatConfig = {
  inputPlaceholder: string;
  pageContext: string;
  welcomeMessage: string;
};

function getPageChatConfig(pathname: string): PageChatConfig {
  if (pathname.startsWith('/ai-enclave/')) {
    const serviceId = pathname.replace('/ai-enclave/', '') as AiEnclaveServiceId;

    try {
      const service = getAiEnclaveService(serviceId);
      return {
        inputPlaceholder: `Ask about ${service.name.toLowerCase()}...`,
        pageContext: service.pageContext,
        welcomeMessage: `I'm AI Saarthi. I can guide you through the ${service.name} workspace and help you use this tool more effectively.`,
      };
    } catch {
      return {
        inputPlaceholder: 'Ask about this AI service...',
        pageContext: 'AI Enclave Service',
        welcomeMessage:
          "I'm AI Saarthi. I can help you navigate this AI Enclave workspace and understand what this tool does.",
      };
    }
  }

  if (pathname === '/features') {
    return {
      inputPlaceholder: 'Ask about courses, pricing, or tracked providers...',
      pageContext: 'Courses & Pricing',
      welcomeMessage:
        "I'm AI Saarthi. I can help you compare tracks, understand pricing, and navigate the course marketplace on this page.",
    };
  }

  if (pathname === '/ai-enclave') {
    return {
      inputPlaceholder: 'Ask about AI Enclave services...',
      pageContext: 'AI Enclave',
      welcomeMessage:
        "I'm AI Saarthi. I can guide you through the AI Enclave services, explain what each tool does, and help you choose the right workspace.",
    };
  }

  if (pathname === '/analytics') {
    return {
      inputPlaceholder: 'Ask about the dashboard sections...',
      pageContext: 'Dashboard',
      welcomeMessage:
        "I'm AI Saarthi. I can explain what this dashboard shows and help you understand the key sections on this page.",
    };
  }

  if (pathname === '/about') {
    return {
      inputPlaceholder: 'Ask about DigiTantra and this page...',
      pageContext: 'About',
      welcomeMessage:
        "I'm AI Saarthi. I can walk you through DigiTantra's vision, mission, and the story presented on this page.",
    };
  }

  if (pathname === '/blog') {
    return {
      inputPlaceholder: 'Ask for help with the blog generator...',
      pageContext: 'Blog',
      welcomeMessage:
        "I'm AI Saarthi. I can help you use the AI Blog Generator and explain what this page is built for.",
    };
  }

  if (pathname === '/login') {
    return {
      inputPlaceholder: 'Ask for help with login...',
      pageContext: 'Login',
      welcomeMessage:
        "I'm AI Saarthi. I can guide you through what this login page is for and how to navigate the platform from here.",
    };
  }

  if (pathname === '/signup') {
    return {
      inputPlaceholder: 'Ask for help with signup...',
      pageContext: 'Signup',
      welcomeMessage:
        "I'm AI Saarthi. I can help you understand the signup page and where to go next inside DigiTantra.",
    };
  }

  return {
    inputPlaceholder: 'Ask Saarthi about this page...',
    pageContext: pathname === '/' ? 'Home' : 'DigiTantra',
    welcomeMessage:
      "I'm AI Saarthi. I can guide you through this page and help you find the right part of DigiTantra faster.",
  };
}

export function GlobalSaarthiChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const pageConfig = useMemo(() => getPageChatConfig(pathname), [pathname]);
  const isContactPage = pathname === '/contact';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isContactPage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      <div className="pointer-events-auto">
        {isOpen ? (
          <div
            className={cn(
              'mb-3 origin-bottom-left transition-all duration-300',
              'translate-y-0 scale-100 opacity-100'
            )}
          >
            <Chatbot
              key={pathname}
              className="h-[min(32rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2rem))] max-w-none rounded-2xl border-primary/40 bg-card/80 shadow-[0_0_24px_hsl(var(--primary)/0.2)] sm:w-[24rem]"
              inputPlaceholder={pageConfig.inputPlaceholder}
              onClose={() => setIsOpen(false)}
              pageContext={pageConfig.pageContext}
              title="AI Saarthi"
              welcomeMessage={pageConfig.welcomeMessage}
            />
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI Saarthi chat' : 'Open AI Saarthi chat'}
          className="group h-14 rounded-full border border-primary/30 bg-card/90 pl-4 pr-5 text-foreground shadow-[0_0_18px_hsl(var(--primary)/0.18)] backdrop-blur-md hover:bg-card"
        >
          <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            {isOpen ? <Sparkles className="h-5 w-5" /> : <MessageCircleMore className="h-5 w-5" />}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">AI Saarthi</span>
            <span className="text-sm font-medium">{isOpen ? 'Close guide' : 'Ask on this page'}</span>
          </span>
        </Button>
      </div>
    </div>
  );
}
