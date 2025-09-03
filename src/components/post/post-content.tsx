
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CardContent } from '@/components/ui/card';

type PostContentViewProps = {
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
}

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

export function PostContentView({ content, mediaUrl, mediaType }: PostContentViewProps) {
    const isPortrait = mediaUrl?.includes('400/600');

    return (
        <CardContent className="p-4 pt-0 space-y-4">
            <p className="whitespace-pre-wrap text-base">
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
    );
}
