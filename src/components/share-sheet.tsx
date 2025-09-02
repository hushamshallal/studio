
"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Post } from './post-card';
import { Skeleton } from './ui/skeleton';
import { Send } from 'lucide-react';

interface ShareSheetProps {
    post: Post;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

type ShareUser = {
    uid: string;
    displayName: string;
    photoURL: string;
    username: string;
}

const UserSkeleton = () => (
    <div className="flex items-center justify-between p-2">
        <div className='flex items-center gap-3'>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-full" />
    </div>
)

export function ShareSheet({ post, isOpen, onOpenChange }: ShareSheetProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<ShareUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // In a real app, you'd fetch friends or followers. Here, we fetch a few users to demo.
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('uid', '!=', user?.uid));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => doc.data() as ShareUser);

                // Ensure the bot is always in the list
                const botDocRef = doc(db, 'users', 'salam_assistant_bot');
                const botDoc = await getDoc(botDocRef);
                if (botDoc.exists()) {
                    const botData = botDoc.data() as ShareUser;
                    // Avoid duplicates
                    if (!usersData.some(u => u.uid === botData.uid)) {
                        usersData.unshift(botData);
                    }
                } else {
                    // Create the bot user if it doesn't exist
                    const botData: ShareUser = {
                        uid: 'salam_assistant_bot',
                        displayName: 'مساعد سلام',
                        username: 'salam_assistant',
                        photoURL: 'https://picsum.photos/seed/bot/100/100'
                    };
                    await setDoc(botDocRef, botData);
                    usersData.unshift(botData);
                }


                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isOpen, user]);

    const handleShare = async (recipient: ShareUser) => {
        if (!user) return;
        setSending(recipient.uid);

        try {
            // Generate a unique conversation ID
            const conversationId = [user.uid, recipient.uid].sort().join('_');
            const conversationRef = doc(db, 'conversations', conversationId);
            const messagesRef = collection(conversationRef, 'messages');

            // Create the message content
            const messageContent = `shared a post: ${post.content}`;
            
            // Add message to Firestore
            await addDoc(messagesRef, {
                senderId: user.uid,
                text: messageContent,
                post: { // Embed post summary
                    id: post.id,
                    authorName: post.authorName,
                    authorHandle: post.authorHandle,
                    content: post.content,
                    mediaUrl: post.mediaUrl || ''
                },
                createdAt: serverTimestamp(),
            });

            // Update the conversation document with the last message
            await setDoc(conversationRef, {
                participants: [user.uid, recipient.uid],
                lastMessage: `🔗 ${post.content.substring(0, 30)}...`,
                lastMessageSender: user.uid,
                lastMessageTimestamp: serverTimestamp(),
            }, { merge: true });

            toast({
                title: "تمت المشاركة!",
                description: `تمت مشاركة المنشور مع ${recipient.displayName}.`
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error sharing post:", error);
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'لم نتمكن من مشاركة المنشور.'
            });
        } finally {
            setSending(null);
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col rounded-t-2xl">
                <SheetHeader className="text-center py-2 border-b">
                    <SheetTitle>مشاركة مع</SheetTitle>
                </SheetHeader>
                <div className="flex-1 py-4 space-y-2 overflow-y-auto">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <UserSkeleton key={i} />)
                    ) : users.length > 0 ? (
                        users.map(u => (
                            <div key={u.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={u.photoURL} alt={u.displayName} data-ai-hint="person" />
                                        <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{u.displayName}</p>
                                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                                    </div>
                                </div>
                                <Button size="sm" className="rounded-full px-5" onClick={() => handleShare(u)} disabled={sending === u.uid}>
                                    {sending === u.uid ? 'جارٍ الإرسال...' : <Send className='w-4 h-4' />}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>لا يوجد مستخدمون لمشاركة المنشور معهم.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
