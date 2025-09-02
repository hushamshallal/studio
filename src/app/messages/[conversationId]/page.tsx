
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chat } from '@/ai/flows/chat-flow';
import Link from 'next/link';

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  post?: {
      id: string;
      authorName: string;
      authorHandle: string;
      content: string;
      mediaUrl: string;
  }
};

type UserProfile = {
  uid: string;
  displayName: string;
  photoURL: string;
};

const MessageItem = ({ msg, isOwnMessage }: { msg: Message; isOwnMessage: boolean }) => {
    return (
        <div className={cn("flex items-end gap-2", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
                "p-3 rounded-2xl max-w-sm md:max-w-md lg:max-w-lg",
                isOwnMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
            )}>
                {msg.post ? (
                    <div className='bg-background/20 p-2 rounded-lg'>
                        <div className='text-xs font-semibold opacity-80 mb-1'>منشور تمت مشاركته</div>
                        <p className='text-sm font-bold'>{msg.post.authorName}</p>
                        <p className='text-xs opacity-90'>@{msg.post.authorHandle}</p>
                        <p className='mt-2 text-sm italic'>"{msg.post.content.substring(0, 100)}..."</p>
                    </div>
                ) : (
                    <p>{msg.text}</p>
                )}
            </div>
        </div>
    );
};

export default function ConversationPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchRecipient = async () => {
        try {
            const conversationRef = doc(db, 'conversations', conversationId);
            const conversationSnap = await getDoc(conversationRef);
            if(conversationSnap.exists()){
                const participants: string[] = conversationSnap.data().participants;
                const recipientId = participants.find(p => p !== user.uid);
                if(recipientId) {
                    const userRef = doc(db, 'users', recipientId);
                    const userSnap = await getDoc(userRef);
                    if(userSnap.exists()){
                        setRecipient(userSnap.data() as UserProfile);
                    }
                }
            }
        } catch(e) {
            console.error(e)
        }
    };
    fetchRecipient();

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgs);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId, user, router]);

  useEffect(() => {
    // Scroll to the bottom when new messages arrive
    if(scrollAreaRef.current){
        const scrollableView = scrollAreaRef.current.children[0] as HTMLDivElement;
        if(scrollableView){
           scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '' || !recipient) return;

    setSending(true);

    const messageData = {
      senderId: user.uid,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    };

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');

    try {
        // Add user's message
        await addDoc(messagesRef, messageData);
        setNewMessage('');

        // Update last message in conversation
        await setDoc(conversationRef, {
            lastMessage: messageData.text,
            lastMessageSender: user.uid,
            lastMessageTimestamp: serverTimestamp(),
        }, { merge: true });

        // If recipient is the bot, trigger the AI flow
        if (recipient.uid === 'salam_assistant_bot') {
            const chatHistory = messages.map(msg => ({
                role: msg.senderId === user.uid ? 'user' : 'model',
                content: msg.text
            }));
            chatHistory.push({ role: 'user', content: messageData.text });
            
            const botReply = await chat({ history: chatHistory });

            const botMessageData = {
                senderId: recipient.uid,
                text: botReply.reply,
                createdAt: serverTimestamp(),
            };
            await addDoc(messagesRef, botMessageData);
            await setDoc(conversationRef, {
                lastMessage: botMessageData.text,
                lastMessageSender: recipient.uid,
                lastMessageTimestamp: serverTimestamp(),
            }, { merge: true });
        }

    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        setSending(false);
    }
  };


  if (loading || !recipient) {
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 p-3 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </header>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-2/3 ml-auto" />
                <Skeleton className="h-12 w-1/3" />
            </div>
            <footer className="p-3 border-t">
                <Skeleton className="h-10 w-full rounded-full" />
            </footer>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center gap-4 p-3 border-b">
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => router.push('/messages')}>
                <ArrowRight className="h-5 w-5" />
            </Button>
            <Link href={`/u/${(recipient as any).username || ''}`} className='flex items-center gap-3'>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={recipient.photoURL} alt={recipient.displayName} data-ai-hint="person" />
                    <AvatarFallback>{recipient.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-lg">{recipient.displayName}</h2>
            </Link>
        </header>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                {messages.map(msg => (
                    <MessageItem key={msg.id} msg={msg} isOwnMessage={msg.senderId === user?.uid} />
                ))}
            </div>
        </ScrollArea>
        <footer className="p-3 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 rounded-full bg-muted focus-visible:ring-1"
                    disabled={sending}
                />
                <Button type="submit" size="icon" className="rounded-full" disabled={sending || newMessage.trim() === ''}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </footer>
    </div>
  );
}
