"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, query, orderBy, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/auth-context';
import { Comment, Reply } from './comment-types';
import { ReplyItem } from './reply-item';
import { CommentActions } from './comment-actions';
import { PostHeader } from '@/components/post/post-header';
import { ReplyInput } from './reply-input';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';


export const CommentItem = ({ comment, postId }: { comment: Comment; postId: string }) => {
    const { user } = useAuth();
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    
     useEffect(() => {
        const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
        const unsubscribe = onSnapshot(commentRef, (doc) => {
            if (doc.exists()) {
                setLikeCount(doc.data().likes || 0);
                setReplyCount(doc.data().replyCount || 0);
            }
        });
        return () => unsubscribe();
    }, [postId, comment.id]);

    useEffect(() => {
        if (showReplyInput) {
            setRepliesLoading(true);
            const repliesRef = collection(db, 'posts', postId, 'comments', comment.id, 'replies');
            const q = query(repliesRef, orderBy('createdAt', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const repliesData = snapshot.docs.map(doc => { 
                    const data = doc.data();
                    return { 
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt ? (data.createdAt.seconds * 1000 + data.createdAt.nanoseconds / 1000000) : Date.now(),
                     } as Reply
                });
                setReplies(repliesData);
                setRepliesLoading(false);
            }, (error) => {
                console.error("Error fetching replies: ", error);
                setRepliesLoading(false);
            });
            return () => unsubscribe();
        }
    }, [showReplyInput, postId, comment.id]);


    return (
        <div className="flex items-start gap-3 p-2">
            <Link href={`/u/${comment.authorHandle}`}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="person" />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                    <div className="flex items-baseline gap-2">
                        <Link href={`/u/${comment.authorHandle}`} className="font-semibold text-sm hover:underline">
                         {comment.authorName}
                        </Link>
                        <span className="text-xs text-muted-foreground">@{comment.authorHandle}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                </div>
                <CommentActions
                    comment={comment}
                    postId={postId}
                    likeCount={likeCount}
                    onReplyClick={() => setShowReplyInput(!showReplyInput)}
                />

                {showReplyInput && (
                    <div className="mt-2 pl-4 border-r-2 border-muted space-y-3">
                        <ReplyInput postId={postId} commentId={comment.id} />
                        <div className="space-y-2">
                            {repliesLoading && <Skeleton className="h-12 w-full" />}
                            {replies.map(reply => (
                                <ReplyItem key={reply.id} reply={reply} />
                            ))}
                        </div>
                    </div>
                )}

                 {replyCount > 0 && !showReplyInput && (
                    <button className="p-0 h-auto text-xs font-semibold text-primary" onClick={() => setShowReplyInput(true)}>
                        عرض {replyCount} من الردود
                    </button>
                )}
            </div>
        </div>
    );
};