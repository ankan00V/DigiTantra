'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Send, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const SUPPORT_EMAIL = 'digitantra.helpdesk@gmail.com';

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || !/^\S+@\S+\.\S+$/.test(email)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Email',
            description: 'Please enter a valid email address.',
        });
        return;
    }

    toast({
        title: 'Subscription Successful!',
        description: 'Our team will connect with you soon.',
    });
    setEmail('');
  };

  return (
    <footer className="border-t border-white/5 bg-background relative z-10">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center sm:gap-12 md:grid-cols-2 md:text-left xl:grid-cols-5">
          
          {/* Column 1: Logo & About */}
          <div className="flex flex-col items-center md:items-start xl:pr-4">
            <img
              src="/footer-logo.png"
              alt="DigiTantra"
              className="h-9 w-auto sm:h-10"
              width="312"
              height="72"
            />
            <p className="mt-4 max-w-xs text-base leading-8 text-muted-foreground sm:max-w-sm">
              DigiTantra is a project-based learning platform designed to equip you with the most in-demand tech skills of tomorrow.
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground sm:max-w-sm">
              Support:
              {' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-primary">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Courses & Pricing</Link></li>
              <li><Link href="/ai-enclave" className="text-muted-foreground hover:text-primary transition-colors">AI Enclave</Link></li>
              <li><Link href="/focus" className="text-muted-foreground hover:text-primary transition-colors">Focus Timer</Link></li>
              <li><Link href="/analytics" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Courses */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-primary">Top Courses</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Gen AI</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Full Stack Development</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Data Science</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Cyber Security</Link></li>
            </ul>
          </div>

          {/* Column 4: Privacy Policy */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-primary">Privacy Policy</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              We only use the information you share to run the platform, respond to enquiries, and improve the learning experience.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Collected: contact details, account activity, and analytics signals.</li>
              <li>Used for: support, platform operations, and course improvements.</li>
              <li>Control: you can request updates or deletion of your data.</li>
            </ul>
            <div className="mt-5">
              <Link href="/privacy-policy" className="font-semibold text-primary transition-colors hover:text-primary/80">
                View full privacy policy
              </Link>
            </div>
          </div>

          {/* Column 5: Stay Connected */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-lg font-semibold text-primary">Stay Connected</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates on courses and tech insights.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:gap-0">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="sm:rounded-r-none" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-11 w-full rounded-md sm:w-11 sm:rounded-l-none sm:rounded-r-md">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
               <a href="https://www.facebook.com/LPUUniversity/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></a>
               <a href="https://www.instagram.com/ft.ankannnn/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></a>
               <a href="https://twitter.com/Lpu_online" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></a>
               <a href="https://www.linkedin.com/in/ghoshankan/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} DigiTantra. All Rights Reserved.{" "}
            <Link href="/privacy-policy" className="text-primary transition-colors hover:text-primary/80">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
