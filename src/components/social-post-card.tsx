import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface SocialPostCardProps {
  platform: 'Instagram' | 'Facebook' | 'Twitter/X';
  image: ImagePlaceholder;
  content: string;
}

export function SocialPostCard({ platform, image, content }: SocialPostCardProps) {
  const platformColors = {
    'Instagram': 'from-yellow-400 via-red-500 to-purple-500',
    'Facebook': 'from-blue-600 to-blue-800',
    'Twitter/X': 'from-gray-700 to-black',
  };

  return (
    <Card className="glassmorphic overflow-hidden group">
      <CardHeader className={`p-4 bg-gradient-to-r ${platformColors[platform]}`}>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="DigMkt Avatar" />
            <AvatarFallback>DM</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-white">DigMkt Official</p>
            <p className="text-xs text-white/80">@{platform.toLowerCase().replace('/', '')}_digmkt</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-base p-4">{content}</p>
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={image.imageUrl}
            alt={image.description}
            data-ai-hint={image.imageHint}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </CardContent>
      <CardFooter className="p-2 flex justify-around">
        <Button variant="ghost" className="text-muted-foreground hover:text-red-500">
          <Heart className="mr-2 h-4 w-4" /> Like
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:text-primary">
          <MessageCircle className="mr-2 h-4 w-4" /> Comment
        </Button>
        <Button variant="ghost" className="text-muted-foreground hover:text-secondary">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
