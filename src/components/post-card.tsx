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

type PostCardProps = {
    username: string;
    userhandle: string;
    avatarUrl: string;
    time: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    likes: number;
    comments: number;
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

export function PostCard({ username, userhandle, avatarUrl, time, content, mediaUrl, mediaType = 'image', likes, comments }: PostCardProps) {
    const isPortrait = mediaUrl?.includes('400/600');

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                    <AvatarImage src={avatarUrl} alt={username} data-ai-hint="person" />
                    <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                    <p className="font-semibold">{username}</p>
                    <p className="text-sm text-muted-foreground">{userhandle} · {time}</p>
                </div>
                <Button variant="ghost" size="icon" className="ms-auto">
                    <MoreHorizontal />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p className="whitespace-pre-wrap">
                    {parseContent(content)}
                </p>
                {mediaUrl && (
                    <div className={`relative w-full overflow-hidden rounded-lg border ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'}`}>
                       {mediaType === 'image' ? (
                         <Image src={mediaUrl} alt="Post media" fill className="object-cover" data-ai-hint="social media post" />
                       ) : (
                         <video src={mediaUrl} controls className="w-full h-full object-cover"></video>
                       )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Heart className="h-5 w-5"/>
                        <span>{likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5"/>
                        <span>{comments}</span>
                    </Button>
                </div>
                 <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                    <Share2 className="h-5 w-5"/>
                    <span>مشاركة</span>
                </Button>
            </CardFooter>
        </Card>
    )
}
