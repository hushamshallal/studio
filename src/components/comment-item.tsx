
"use client";

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useState, useEffect } from 'react';

export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};


const formatTimestamp = (timestamp: Comment['createdAt']) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};

export const CommentItem = ({ comment }: { comment: Comment }) => {
    const timeAgo = formatTimestamp(comment.createdAt);
    const [authorHandle, setAuthorHandle] = useState('');

    useEffect(() => {
        const fetchUserHandle = async () => {
            if (comment.authorId) {
                const userDocRef = doc(db, 'users', comment.authorId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setAuthorHandle(userDoc.data().username || '');
                }
            }
        };
        fetchUserHandle();
    }, [comment.authorId]);


    return (
        <div className="flex items-start gap-3">
            <Link href={authorHandle ? `/u/${authorHandle}` : '#'}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="person" />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                    <div className="flex items-baseline gap-2">
                        <Link href={authorHandle ? `/u/${authorHandle}` : '#'} className="font-semibold text-sm hover:underline">
                         {comment.authorName}
                        </Link>
                        {authorHandle && <span className="text-xs text-muted-foreground">@{authorHandle}</span>}
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">{timeAgo}</p>
            </div>
        </div>
    );
};
