import type { Metadata } from 'next';
import { BlogGenerator } from '@/components/blog-generator';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';

export const metadata: Metadata = {
  title: 'Blog | DigiTantra',
  description: 'Read insights on digital marketing or generate your own AI-powered blog post.',
};

export default function BlogPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <PageSpecific3DAnimation type="blog" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Blog & <span className="text-glow-primary text-primary">Insights</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Explore topics on digital marketing, SEO, and AI, or create your own content with our AI-powered tool.
          </p>
        </div>

        <BlogGenerator />
      </div>
    </div>
  );
}
