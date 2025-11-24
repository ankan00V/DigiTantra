
import type { Metadata } from 'next';
import { BlogGenerator } from '@/components/blog-generator';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Blog Generator | DigiTantra',
  description: 'Generate your own AI-powered blog post on digital marketing, SEO, and more.',
};

export default function BlogPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <PageSpecific3DAnimation type="blog" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            AI-Powered <span className="text-glow-primary text-primary">Blog Generator</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Unleash your creativity. Enter any topic related to digital marketing, and watch our AI craft a unique blog post for you in seconds.
          </p>
        </div>

        <div className="mt-16">
          <BlogGenerator />
        </div>
      </div>
    </div>
  );
}
