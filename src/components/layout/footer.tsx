import Link from 'next/link';
import { Facebook, Instagram, Twitter, Send, Linkedin } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          
          {/* Column 1: Logo & About */}
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              DigiTantra is a project-based learning platform designed to equip you with the most in-demand tech skills of tomorrow.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-headline text-lg font-semibold text-primary">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Courses & Pricing</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
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

          {/* Column 4: Stay Connected */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-lg font-semibold text-primary">Stay Connected</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates on courses and tech insights.
            </p>
            <div className="mt-4 flex w-full max-w-sm">
              <Input type="email" placeholder="Your email address" className="rounded-r-none" />
              <Button type="submit" size="icon" className="rounded-l-none">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-4 mt-6">
               <a href="https://www.facebook.com/LPUUniversity/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></a>
               <a href="https://www.instagram.com/lpuuniversity/?hl=en" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></a>
               <a href="https://x.com/lpuuniversity" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></a>
               <a href="https://in.linkedin.com/school/lovely-professional-university/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DigiTantra. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
