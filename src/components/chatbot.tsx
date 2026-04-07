'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

type ChatbotProps = {
  className?: string;
  inputPlaceholder?: string;
  onClose?: () => void;
  pageContext?: string;
  title?: string;
  welcomeMessage?: string;
};

export function Chatbot({
  className,
  inputPlaceholder = 'Ask about this page...',
  onClose,
  pageContext,
  title = 'AI Saarthi',
  welcomeMessage = "Hello! I'm AI Saarthi. How can I guide you on this page?",
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input, pageContext }),
      });

      if (!response.ok) {
        throw new Error('Chatbot request failed.');
      }

      const payload = (await response.json()) as { response: string };
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: payload.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "glassmorphic mx-auto flex h-[540px] w-full max-w-2xl flex-col overflow-hidden rounded-lg border-primary/50 shadow-2xl shadow-primary/20 shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 transform-gpu sm:h-[600px]",
      className
    )}>
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <div className='flex items-center gap-3'>
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="font-headline text-lg sm:text-xl">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className='h-12 w-16 sm:h-14 sm:w-20'>
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-[radial-gradient(circle_at_center,rgba(126,87,255,0.28),transparent_60%)]">
                <div className={cn(
                  'absolute h-8 w-8 rounded-full border border-primary/35 bg-primary/10 blur-[1px]',
                  isLoading ? 'animate-spin' : 'animate-pulse'
                )} />
                <div className="absolute h-11 w-11 rounded-full border border-secondary/25" />
                <Sparkles className={cn('relative z-10 h-5 w-5 text-primary', isLoading && 'animate-pulse')} />
              </div>
          </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close Saarthi chat"
              className="h-9 w-9 shrink-0"
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          ) : null}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-lg p-3 sm:max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent'
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-secondary/20 text-secondary">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-accent flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="shrink-0 border-t p-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            disabled={isLoading}
            autoComplete='off'
            className="h-12 pr-12 text-sm sm:text-base"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
