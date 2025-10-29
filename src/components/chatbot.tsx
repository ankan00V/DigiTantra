'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import type { Message } from '@/lib/types';
import { aiChatbotAssistance } from '@/ai/flows/ai-chatbot-assistance';
import { cn } from '@/lib/utils';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';

const Chatbot3DElement = ({ isLoading }: { isLoading: boolean }) => {
    const groupRef = useRef<THREE.Group>(null!);
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * (isLoading ? 0.5 : 0.1);
        }
    });

    const headMaterial = <meshStandardMaterial color="hsl(var(--primary))" wireframe emissive="hsl(var(--primary))" emissiveIntensity={isLoading ? 1.0 : 0.4} />
    const eyeMaterial = <meshStandardMaterial color="hsl(var(--foreground))" emissive="hsl(var(--foreground))" emissiveIntensity={isLoading ? 1.5 : 0.5} />

    return (
        <group ref={groupRef} scale={0.7} position={[0, -0.2, 0]}>
            {/* Head */}
            <Box args={[1.5, 1.5, 1.5]}>
                {headMaterial}
            </Box>
            {/* Eyes */}
            <Sphere args={[0.2, 16, 16]} position={[-0.4, 0.2, 0.75]}>
                {eyeMaterial}
            </Sphere>
            <Sphere args={[0.2, 16, 16]} position={[0.4, 0.2, 0.75]}>
                {eyeMaterial}
            </Sphere>
        </group>
    )
};


export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm the DigMkt AI assistant. How can I help you with your digital marketing questions?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await aiChatbotAssistance({ query: input });
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glassmorphic rounded-lg flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-2xl shadow-primary/10 border-primary/20">
      <div className="p-4 border-b flex items-center justify-between">
        <div className='flex items-center gap-3'>
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="font-headline text-xl">AI Assistant</h3>
        </div>
        <div className='w-20 h-14'>
            <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}>
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5,5,5]} intensity={1} color="hsl(var(--primary))" />
                    <Chatbot3DElement isLoading={isLoading} />
                </Canvas>
            </Suspense>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                  'p-3 rounded-lg max-w-[80%]',
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
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about digital marketing..."
            disabled={isLoading}
            autoComplete='off'
            className="pr-12 h-12 text-base"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
