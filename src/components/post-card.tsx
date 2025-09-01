import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';

export type Post = {
    id: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    likes: number;
    comments: number;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

const parseContent = (content: string) => {
    const parts = content.split(/([#@]\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Link href={`/u/${part.substring(1)}`} key={index} className="text-primary hover:underline font-medium">
            {part}
          </Link>
        );
      }
      if (part.startsWith('#')) {
        return (
          <Link href={`/tags/${part.substring(1)}`} key={index} className="text-primary hover:underline font-medium">
            {part}
          </Link>
        );
      }
      return part;
    });
};

const formatTimestamp = (timestamp: Post['createdAt']) => {
    if (!timestamp) return 'الآن';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};


export function PostCard({ post }: { post: Post }) {
    const isPortrait = post.mediaUrl?.includes('400/600');

    return (
        <Card className="overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                    <AvatarImage src={post.authorAvatar} alt={post.authorName} data-ai-hint="person" />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0">
                    <p className="font-semibold">{post.authorName}</p>
                    <p className="text-sm text-muted-foreground">@{post.authorHandle} · {formatTimestamp(post.createdAt)}</p>
                </div>
                <Button variant="ghost" size="icon" className="ms-auto rounded-full">
                    <MoreHorizontal />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p className="whitespace-pre-wrap text-base">
                    {parseContent(post.content)}
                </p>
                {post.mediaUrl && (
                    <div className={`relative w-full overflow-hidden rounded-lg border ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'}`}>
                       {post.mediaType === 'image' ? (
                         <Image src={post.mediaUrl} alt="Post media" fill className="object-cover" data-ai-hint="social media post" />
                       ) : (
                         <video src={post.mediaUrl} controls className="w-full h-full object-cover"></video>
                       )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex gap-1 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full">
                        <Heart className="h-5 w-5"/>
                        <span>{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full">
                        <MessageCircle className="h-5 w-5"/>
                        <span>{post.comments}</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full">
                        <Share2 className="h-5 w-5"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
