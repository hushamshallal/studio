
"use client";

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';


export type Notification = {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    user: {
        name: string;
        avatarUrl: string;
    };
    postContent?: string;
    timestamp: Date;
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

export const NotificationItem = ({ notification }: { notification: Notification }) => {
    const timeAgo = formatDistanceToNowStrict(notification.timestamp, { addSuffix: true, locale: ar });

    return (
        <Link href="#" className={cn(
            "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
            !notification.isRead && "bg-muted"
        )}>
            <div className="w-6 flex-shrink-0 pt-1">
                {ICONS[notification.type]}
            </div>
            <div className="flex-1">
                <Avatar className="h-8 w-8 mb-2">
                    <AvatarImage src={notification.user.avatarUrl} alt={notification.user.name} />
                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-base">
                    <span className="font-bold">{notification.user.name}</span>
                    {' '}
                    {getNotificationText(notification)}
                </p>
                {notification.postContent && (
                     <p className="text-sm text-muted-foreground mt-1 pl-2 border-r-2 pr-2">
                        "{notification.postContent}"
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
            </div>
            {!notification.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 self-center" />
            )}
        </Link>
    );
};
