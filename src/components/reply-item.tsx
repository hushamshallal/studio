
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export type Reply = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorHandle: string;
    text: string;
    createdAt: number | {
        seconds: number;
        nanoseconds: number;
    };
    likes: number;
};

const formatTimestamp = (timestamp: Reply['createdAt']) => {
    if (!timestamp) return '';
     const date = typeof timestamp === 'number'
        ? new Date(timestamp)
        : new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};


export const ReplyItem = ({ reply }: { reply: Reply }) => {
    const [authorHandle, setAuthorHandle] = useState(reply.authorHandle || '');
    const timeAgo = formatTimestamp(reply.createdAt);

    useEffect(() => {
        if (!authorHandle && reply.authorId) {
            const fetchUserHandle = async () => {
                const userDocRef = doc(db, 'users', reply.authorId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setAuthorHandle(userDoc.data().username || '');
                }
            };
            fetchUserHandle();
        }
    }, [reply.authorId, authorHandle]);


    return (
        <div className="flex items-start gap-2">
            <Link href={authorHandle ? `/u/${authorHandle}` : '#'}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.authorAvatar} alt={reply.authorName} data-ai-hint="person" />
                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className="bg-background border p-2.5 rounded-lg rounded-tl-none">
                    <div className="flex items-baseline gap-2">
                        <Link href={authorHandle ? `/u/${authorHandle}` : '#'} className="font-semibold text-xs hover:underline">
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
