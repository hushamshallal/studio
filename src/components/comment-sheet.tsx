
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, runTransaction, doc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CommentItem, Comment } from './comment-item';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';


interface CommentSheetProps {
    postId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const CommentSkeleton = () => (
    <div className="flex items-start gap-3 p-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
        </div>
    </div>
)

export function CommentSheet({ postId, isOpen, onOpenChange }: CommentSheetProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !postId) return;

        setIsLoading(true);
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || 0,
                replyCount: doc.data().replyCount || 0,
            } as Comment));
            setComments(commentsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching comments:", error);
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'لم نتمكن من تحميل التعليقات.'
            })
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [postId, isOpen, toast]);
    
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || newComment.trim() === '' || isPosting) return;

        setIsPosting(true);
        const postRef = doc(db, 'posts', postId);
        const commentsRef = collection(postRef, 'comments');

        try {
             const newCommentData = {
                authorId: user.uid,
                authorName: user.displayName,
                authorAvatar: user.photoURL,
                text: newComment.trim(),
                createdAt: serverTimestamp(),
                likes: 0,
                replyCount: 0
            };
            
            await addDoc(commentsRef, newCommentData);
            
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) {
                    throw new Error("Post does not exist!");
                }
                
                const newCommentCount = (postDoc.data().comments || 0) + 1;
                transaction.update(postRef, { comments: newCommentCount });
            });

            setNewComment('');

        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'لم نتمكن من إضافة تعليقك. حاول مرة أخرى.',
            });
        } finally {
            setIsPosting(false);
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col rounded-t-2xl">
                <SheetHeader className="text-center py-2 border-b">
                    <SheetTitle>التعليقات</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 pr-4 -mr-6">
                    <div className="py-4 space-y-4">
                       {isLoading ? (
                           Array.from({ length: 5 }).map((_, i) => <CommentSkeleton key={i} />)
                       ) : comments.length > 0 ? (
                            comments.map(comment => <CommentItem key={comment.id} comment={comment} postId={postId} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-16">
                                <p className="font-semibold">لا توجد تعليقات بعد.</p>
                                <p className="text-sm">كن أول من يعلق!</p>
                            </div>
                        )}
                        <div className="h-16" />
                    </div>
                </ScrollArea>
                <SheetFooter className="mt-auto py-2 border-t bg-background">
                    <form onSubmit={handleAddComment} className="flex items-center gap-2 w-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || ''} data-ai-hint="person" />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="أضف تعليقًا..."
                            className="flex-1 rounded-full bg-muted focus-visible:ring-1"
                            disabled={isPosting}
                        />
                        <Button type="submit" size="icon" className="rounded-full" disabled={isPosting || newComment.trim() === ''}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
