'use client';

import { useState } from 'react';
import { generateBlogPost, GenerateBlogPostOutput } from '@/ai/flows/generate-blog-posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

export function BlogGenerator() {
  const [topic, setTopic] = useState('AI in Marketing');
  const [loading, setLoading] = useState(false);
  const [blogPost, setBlogPost] = useState<GenerateBlogPostOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBlogPost(null);

    try {
      const result = await generateBlogPost({ topic });
      setBlogPost(result);
    } catch (err) {
      setError('Failed to generate blog post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16">
      <Card className="glassmorphic max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Blog Post Generator
          </CardTitle>
          <CardDescription>
            Enter a topic related to digital marketing, and our AI will write a blog post for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., SEO trends in 2024"
              disabled={loading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Post'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="mt-8 text-center text-destructive">
          <p>{error}</p>
        </div>
      )}

      {blogPost && (
        <article className="mt-12 max-w-3xl mx-auto prose prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-secondary hover:prose-a:text-secondary/80">
          <h2 className='text-3xl font-bold text-glow-primary'>{blogPost.title}</h2>
          <div
             className="mt-6 space-y-4"
             dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }}
          />
        </article>
      )}
    </div>
  );
}
