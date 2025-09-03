
"use client";

import React, { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase/config';
import { doc, runTransaction, onSnapshot } from 'firebase/firestore';
import { Comment } from './comment-types';

type CommentActionsProps = {
    comment: Comment;
    postId: string;
    likeCount: number;
    onReplyClick: () => void;
};

const formatTimestamp = (timestamp: Comment['createdAt']) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};

export const CommentActions = ({ comment, postId, likeCount, onReplyClick }: CommentActionsProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    const timeAgo = formatTimestamp(comment.createdAt);

    useEffect(() => {
        if (!user) return;
        const likeRef = doc(db, 'posts', postId, 'comments', comment.id, 'likes', user.uid);
        const unsubscribe = onSnapshot(likeRef, (doc) => {
            setIsLiked(doc.exists());
        });
        return () => unsubscribe();
    }, [postId, comment.id, user]);

    const handleLikeToggle = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "يجب تسجيل الدخول أولاً" });
            return;
        }
        if (isLikeLoading) return;
        setIsLikeLoading(true);

        const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
        const likeRef = doc(commentRef, 'likes', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                if (!commentDoc.exists()) {
                    throw new Error("Comment does not exist!");
                }
                const currentLikeCount = commentDoc.data().likes || 0;
                const likeDoc = await transaction.get(likeRef);

                if (likeDoc.exists()) {
                    transaction.delete(likeRef);
                    transaction.update(commentRef, { likes: currentLikeCount - 1 });
                } else {
                    transaction.set(likeRef, { userId: user.uid, createdAt: new Date() });
                    transaction.update(commentRef, { likes: currentLikeCount + 1 });
                }
            });
        } catch (error) {
            console.error("Failed to like comment:", error);
            toast({ variant: "destructive", title: "حدث خطأ ما" });
        } finally {
            setIsLikeLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 px-1 mt-1.5">
             <p className="text-xs text-muted-foreground">{timeAgo}</p>
             <Button variant="ghost" size="sm" className="p-0 h-auto text-xs font-semibold text-muted-foreground" onClick={onReplyClick}>
                رد
             </Button>
             <button
                onClick={handleLikeToggle}
                disabled={isLikeLoading}
                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
             >
                <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                <span className="text-xs font-semibold">{likeCount > 0 ? likeCount : ''}</span>
            </button>
        </div>
    );
};
