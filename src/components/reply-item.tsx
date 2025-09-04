
"use client";

import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Reply } from './comment-types';
import { Timestamp } from 'firebase/firestore';


const formatTimestamp = (timestamp: Reply['createdAt']) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
        ? new Date(timestamp) 
        : (timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000));
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};


export const ReplyItem = ({ reply }: { reply: Reply }) => {
    const timeAgo = formatTimestamp(reply.createdAt);

    return (
        <div className="flex items-start gap-2">
            <Link href={`/u/${reply.authorHandle}`}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.authorAvatar} alt={reply.authorName} data-ai-hint="person" />
                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className="bg-background border p-2.5 rounded-lg rounded-tl-none">
                    <div className="flex items-baseline gap-2">
                        <Link href={`/u/${reply.authorHandle}`} className="font-semibold text-xs hover:underline">
                         {reply.authorName}
                        </Link>
                         <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                    <p className="text-sm mt-1">{reply.text}</p>
                </div>
            </div>
        </div>
    )
}
