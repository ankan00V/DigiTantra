'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import type { Message } from '@/lib/types';
import { aiChatbotAssistance } from '@/ai/flows/ai-chatbot-assistance';
import { cn } from '@/lib/utils';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

const Chatbot3DElement = ({ isLoading }: { isLoading: boolean }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const icosahedronRef = useRef<THREE.Mesh>(null!);
    const torusKnotRef = useRef<THREE.Mesh>(null!);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            const time = state.clock.getElapsedTime();
            groupRef.current.rotation.y += delta * 0.1;
            
            if (icosahedronRef.current) {
                icosahedronRef.current.rotation.x += delta * 0.2;
                icosahedronRef.current.rotation.z += delta * 0.2;
                 if (icosahedronRef.current.material instanceof THREE.MeshStandardMaterial) {
                    const targetIntensity = isLoading ? 1.5 + Math.sin(time * 5) * 0.5 : 0.6;
                    icosahedronRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(icosahedronRef.current.material.emissiveIntensity, targetIntensity, 0.1);
                 }
            }

            if (torusKnotRef.current) {
                torusKnotRef.current.rotation.y += delta * 0.5;
            }
        }
    });

    return (
        <group ref={groupRef}>
             <Icosahedron ref={icosahedronRef} args={[0.8, 1]}>
                <meshStandardMaterial 
                    color="purple" 
                    wireframe 
                    emissive="purple" 
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.8}
                />
            </Icosahedron>
            <TorusKnot ref={torusKnotRef} args={[1.2, 0.02, 1000, 16]}>
                 <meshStandardMaterial 
                    color="hsl(var(--primary))"
                    emissive="hsl(var(--primary))"
                    emissiveIntensity={0.2}
                 />
            </TorusKnot>
        </group>
    )
};


export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm the DigiTantra AI assistant. How can I help you with your tech questions?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const { top } = containerRef.current.getBoundingClientRect();
      const speed = -0.1;
      containerRef.current.style.transform = `translateY(${top * speed}px) rotateX(-10deg) scale(1.05)`;
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div ref={containerRef} className="glassmorphic rounded-lg flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-2xl shadow-primary/20 border-primary/20 transition-all duration-300 transform-gpu" style={{ perspective: '1000px', transform: 'rotateX(-10deg) scale(1.05)' }}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className='flex items-center gap-3'>
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="font-headline text-xl">AI Assistant</h3>
        </div>
        <div className='w-20 h-14'>
            <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}>
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
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
            placeholder="Ask about our tech courses..."
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
