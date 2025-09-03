
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, runTransaction, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export const ReplyInput = ({ postId, commentId }: { postId: string; commentId: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newReply, setNewReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);
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

    const handleAddReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !currentUserData || newReply.trim() === '' || isReplying) return;

        setIsReplying(true);
        const commentRef = doc(db, 'posts', postId, 'comments', commentId);
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
    );
}
