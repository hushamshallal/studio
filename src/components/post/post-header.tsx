
"use client";

import { CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Post } from './post-types';
import { Timestamp } from 'firebase/firestore';

type PostHeaderProps = {
    authorAvatar: string;
    authorName: string;
    authorHandle: string;
    createdAt: number | { seconds: number, nanoseconds: number } | Timestamp;
};

const formatTimestamp = (timestamp: PostHeaderProps['createdAt']) => {
    if (!timestamp) return 'الآن';
    
    const date = typeof timestamp === 'number' 
        ? new Date(timestamp) 
        : (timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000));
        
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};

export function PostHeader({ authorAvatar, authorName, authorHandle, createdAt }: PostHeaderProps) {
    return (
        <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Link href={`/u/${authorHandle}`}>
                <Avatar>
                    <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="person" />
                    <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="grid gap-0">
              <Link href={`/u/${authorHandle}`} className="hover:underline">
                <p className="font-semibold">{authorName}</p>
              </Link>
              <p className="text-sm text-muted-foreground">@{authorHandle} · {formatTimestamp(createdAt)}</p>
            </div>
            <Button variant="ghost" size="icon" className="ms-auto rounded-full">
                <MoreHorizontal />
            </Button>
        </CardHeader>
    );
}
