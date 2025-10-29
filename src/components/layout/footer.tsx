import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground text-center md:text-left">
              DigMkt — The Future of Digital Marketing. An academic project for MKT311.
            </p>
          </div>
          <div className="flex justify-center">
            <div>
              <h3 className="font-headline text-lg text-primary">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end">
             <h3 className="font-headline text-lg text-secondary">Follow Us</h3>
             <div className="flex space-x-4 mt-4">
               <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></a>
               <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></a>
               <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></a>
             </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DigMkt. All Rights Reserved. Created for academic purposes.</p>
        </div>
      </div>
    </footer>
  );
}
