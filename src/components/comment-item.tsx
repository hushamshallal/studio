
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, onSnapshot, runTransaction, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { ReplyItem, Reply } from './reply-item';
import { Skeleton } from './ui/skeleton';

export type Comment = {
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
    replyCount?: number;
};

const formatTimestamp = (timestamp: Comment['createdAt']) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number'
        ? new Date(timestamp)
        : new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};

export const CommentItem = ({ comment, postId }: { comment: Comment; postId: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [authorHandle, setAuthorHandle] = useState(comment.authorHandle || '');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
    const [currentUserData, setCurrentUserData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setCurrentUserData(docSnap.data());
                }
            })
        }
    }, [user]);

    const timeAgo = formatTimestamp(comment.createdAt);

    useEffect(() => {
        if (!authorHandle && comment.authorId) {
            const fetchUserHandle = async () => {
                const userDocRef = doc(db, 'users', comment.authorId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setAuthorHandle(userDoc.data().username || '');
                }
            };
            fetchUserHandle();
        }
    }, [comment.authorId, authorHandle]);
    
    // Listen for real-time updates on the comment's like and reply count
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

    // Check if the current user has liked this comment
    useEffect(() => {
        if (!user) return;
        const likeRef = doc(db, 'posts', postId, 'comments', comment.id, 'likes', user.uid);
        const unsubscribe = onSnapshot(likeRef, (doc) => {
            setIsLiked(doc.exists());
        });
        return () => unsubscribe();
    }, [postId, comment.id, user]);

    // Fetch replies when reply section is opened
    useEffect(() => {
        if (showReplyInput) {
            setRepliesLoading(true);
            const repliesRef = collection(db, 'posts', postId, 'comments', comment.id, 'replies');
            const q = query(repliesRef, orderBy('createdAt', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const repliesData = snapshot.docs.map(doc => ({ 
                    id: doc.id,
                     ...doc.data(),
                    createdAt: (doc.data().createdAt?.seconds * 1000) || Date.now()
                } as Reply));
                setReplies(repliesData);
                setRepliesLoading(false);
            }, (error) => {
                console.error("Error fetching replies: ", error);
                setRepliesLoading(false);
            });
            return () => unsubscribe();
        }
    }, [showReplyInput, postId, comment.id]);

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
                    // Unlike
                    transaction.delete(likeRef);
                    transaction.update(commentRef, { likes: currentLikeCount - 1 });
                } else {
                    // Like
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
    
    const handleAddReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !currentUserData || newReply.trim() === '' || isReplying) return;

        setIsReplying(true);
        const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
        const repliesRef = collection(commentRef, 'replies');

        try {
            await runTransaction(db, async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                 if (!commentDoc.exists()) {
                    throw new Error("Comment does not exist!");
                }
                
                const newReplyData = {
                    authorId: user.uid,
                    authorName: currentUserData.displayName,
                    authorAvatar: currentUserData.photoURL,
                    authorHandle: currentUserData.username,
                    text: newReply.trim(),
                    createdAt: serverTimestamp(),
                    likes: 0
                };
                
                transaction.set(doc(repliesRef), newReplyData);
                
                const currentReplyCount = commentDoc.data().replyCount || 0;
                transaction.update(commentRef, { replyCount: currentReplyCount + 1 });
            });
            setNewReply('');
        } catch(error) {
            console.error("Failed to add reply:", error);
            toast({ variant: "destructive", title: "حدث خطأ أثناء إضافة الرد" });
        } finally {
            setIsReplying(false);
        }
    }


    return (
        <div className="flex items-start gap-3 p-2">
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
                <div className="flex items-center gap-4 px-1 mt-1.5">
                     <p className="text-xs text-muted-foreground">{timeAgo}</p>
                     <Button variant="ghost" size="sm" className="p-0 h-auto text-xs font-semibold text-muted-foreground" onClick={() => setShowReplyInput(!showReplyInput)}>
                        {showReplyInput ? 'إخفاء الردود' : 'رد'}
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

                {showReplyInput && (
                    <div className="mt-2 pl-4 border-r-2 border-muted space-y-3">
                        <form onSubmit={handleAddReply} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUserData?.photoURL || ''} data-ai-hint="person" />
                                <AvatarFallback>{currentUserData?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <Input 
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="اكتب ردك..."
                                className="flex-1 h-9 rounded-full bg-background"
                                disabled={isReplying}
                            />
                             <Button type="submit" size="sm" className="rounded-full" disabled={isReplying || newReply.trim() === ''}>
                                {isReplying ? '...' : 'رد'}
                            </Button>
                        </form>
                        <div className="space-y-2">
                            {repliesLoading && <Skeleton className="h-12 w-full" />}
                            {replies.map(reply => (
                                <ReplyItem key={reply.id} reply={reply} />
                            ))}
                        </div>
                    </div>
                )}

                 {replyCount > 0 && !showReplyInput && (
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs font-semibold text-primary" onClick={() => setShowReplyInput(true)}>
                        عرض {replyCount} من الردود
                    </Button>
                )}

            </div>
        </div>
    );
};
