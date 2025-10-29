import type { Metadata } from 'next';
import { BlogGenerator } from '@/components/blog-generator';

export const metadata: Metadata = {
  title: 'Blog | DigMkt',
  description: 'Read insights on digital marketing or generate your own AI-powered blog post.',
};

export default function BlogPage() {
  return (
    <div className="animated-gradient-bg min-h-screen">
      <div className="main-container">
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
