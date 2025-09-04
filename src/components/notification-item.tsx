
"use client";

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';


export type Notification = {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    fromUser: {
        name: string;
        username: string;
        avatarUrl: string;
    };
    post?: {
        id: string;
        content: string;
    },
    comment?: {
        text: string;
    },
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
    isRead: boolean;
};

const ICONS = {
    like: <Heart className="h-5 w-5 text-red-500" />,
    comment: <MessageCircle className="h-5 w-5 text-blue-500" />,
    follow: <UserPlus className="h-5 w-5 text-green-500" />,
    mention: <AtSign className="h-5 w-5 text-purple-500" />,
}

const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
        case 'like':
            return 'أعجب بمنشورك.';
        case 'comment':
            return 'علّق على منشورك:';
        case 'follow':
            return 'بدأ بمتابعتك.';
        case 'mention':
            return 'أشار إليك في منشور:';
        default:
            return '';
    }
}

const getNotificationLink = (notification: Notification): string => {
    switch(notification.type){
        case 'follow':
            return `/u/${notification.fromUser.username}`;
        case 'like':
        case 'comment':
        case 'mention':
            // Although we don't have a dedicated post page, we can link to the homepage
            // and in a future iteration, scroll to the specific post.
            // For now, linking to homepage is better than a dead link.
            return `/?postId=${notification.post?.id || ''}`;
        default:
            return '#';
    }
}

export const NotificationItem = ({ notification }: { notification: Notification }) => {
    const timeAgo = notification.timestamp ? formatDistanceToNowStrict(new Date(notification.timestamp.seconds * 1000), { addSuffix: true, locale: ar }) : '';
    const content = notification.comment?.text || notification.post?.content;
    const link = getNotificationLink(notification);


    return (
        <Link href={link} className={cn(
            "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
            !notification.isRead && "bg-primary/5"
        )}>
            <div className="w-6 flex-shrink-0 pt-1">
                {ICONS[notification.type]}
            </div>
            <div className="flex-1">
                <Link href={`/u/${notification.fromUser.username}`}>
                    <Avatar className="h-8 w-8 mb-2">
                        <AvatarImage src={notification.fromUser.avatarUrl} alt={notification.fromUser.name} />
                        <AvatarFallback>{notification.fromUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <p className="text-base">
                    <Link href={`/u/${notification.fromUser.username}`} className="font-bold hover:underline">{notification.fromUser.name}</Link>
                    {' '}
                    {getNotificationText(notification)}
                </p>
                {content && (
                     <p className="text-sm text-muted-foreground mt-1 pl-2 border-r-2 pr-2">
                        "{content.substring(0, 70)}..."
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
            </div>
            {!notification.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary self-center" />
            )}
        </Link>
    );
};


export const NotificationSkeleton = () => (
    <div className="flex items-start gap-4 p-4">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);
