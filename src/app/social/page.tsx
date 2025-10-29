import type { Metadata } from 'next';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SocialPostCard } from '@/components/social-post-card';
import { PageSpecific3DAnimation } from '@/components/page-specific-3d-animation';

export const metadata: Metadata = {
  title: 'Social Media | DigMkt',
  description: 'Follow DigMkt on social media and view our latest posts and updates.',
};

const posts = [
    {
        platform: "Instagram",
        content: "Data meets design. ✨ We're DigMkt, a new concept in digital marketing strategy. #DigitalMarketing #AI #SEO #Innovation",
        image: PlaceHolderImages.find(img => img.id === 'social-1')!
    },
    {
        platform: "Twitter/X",
        content: "Just launched! DigMkt is a project exploring the future of digital marketing. Check out our AI-powered features and data-driven insights. Link in bio!",
        image: PlaceHolderImages.find(img => img.id === 'social-2')!
    },
    {
        platform: "Facebook",
        content: "Welcome to DigMkt! Our mission is to demonstrate a complete digital marketing ecosystem, merging branding, analytics, SEO, and AI. This academic project showcases the power of a cohesive online strategy. Follow us for insights and updates!",
        image: PlaceHolderImages.find(img => img.id === 'social-3')!
    }
]

export default function SocialPage() {
  return (
    <div className="relative overflow-hidden">
        <PageSpecific3DAnimation type="social" />
      <div className="main-container relative z-10">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Our <span className="text-glow-primary text-primary">Social</span> Presence
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Engaging content across platforms to build our brand and connect with our audience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
                <SocialPostCard key={index} platform={post.platform as any} content={post.content} image={post.image} />
            ))}
        </div>
      </div>
    </div>
  );
}
