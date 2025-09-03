
"use client";

import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PostActionsProps = {
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    isLikeLoading: boolean;
    onLikeToggle: () => void;
    onCommentClick: () => void;
    onShareClick: () => void;
};

export function PostActions({
    likeCount,
    commentCount,
    isLiked,
    isLikeLoading,
    onLikeToggle,
    onCommentClick,
    onShareClick,
}: PostActionsProps) {
    return (
        <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex gap-1 text-muted-foreground">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={onLikeToggle} disabled={isLikeLoading}>
                    <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}/>
                    <span>{likeCount}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={onCommentClick}>
                    <MessageCircle className="h-5 w-5"/>
                    <span>{commentCount}</span>
                </Button>
                 <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={onShareClick}>
                    <Share2 className="h-5 w-5"/>
                </Button>
            </div>
        </CardFooter>
    );
}
