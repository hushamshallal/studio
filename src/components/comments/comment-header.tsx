
"use client";

import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

type CommentHeaderProps = {
    authorAvatar: string;
    authorName: string;
    authorHandle: string;
    text: string;
};

export const CommentHeader = ({ authorAvatar, authorName, authorHandle, text }: CommentHeaderProps) => {
    return (
        <div className="flex-1">
            <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                <div className="flex items-baseline gap-2">
                    <Link href={`/u/${authorHandle}`} className="font-semibold text-sm hover:underline">
                     {authorName}
                    </Link>
                    <span className="text-xs text-muted-foreground">@{authorHandle}</span>
                </div>
                <p className="text-sm mt-1">{text}</p>
            </div>
        </div>
    );
};
