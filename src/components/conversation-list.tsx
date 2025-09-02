
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from 'firebase/auth';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';

type Conversation = {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageSender: string;
    lastMessageTimestamp: {
        seconds: number;
        nanoseconds: number;
    } | null;
    participantDetails: { [key: string]: {
        displayName: string;
        photoURL: string;
    }}
};

export type ConversationWithUserData = Conversation & {
    otherUser?: {
        uid: string;
        displayName: string;
        photoURL: string;
    }
}

const formatTimestamp = (timestamp: Conversation['lastMessageTimestamp']) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: false, locale: ar });
};

const ConversationItem = ({ conversation, currentUser }: { conversation: ConversationWithUserData; currentUser: User }) => {
    const pathname = usePathname();
    const [otherUser, setOtherUser] = useState(conversation.otherUser);
    const [lastMessage, setLastMessage] = useState(conversation.lastMessage || '');
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(conversation.lastMessageTimestamp || null);

    useEffect(() => {
        if (conversation.otherUser) {
            setOtherUser(conversation.otherUser);
            return;
        }

        const otherUserId = conversation.participants.find(p => p !== currentUser.uid);
        if (otherUserId) {
            const userDocRef = doc(db, 'users', otherUserId);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setOtherUser({
                        uid: docSnap.id,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL
                    });
                }
            });
        }
    }, [conversation, currentUser.uid]);

    // Listen for real-time updates on the last message
    useEffect(() => {
        const conversationRef = doc(db, 'conversations', conversation.id);
        const unsubscribe = onSnapshot(conversationRef, (doc) => {
            if(doc.exists()){
                const data = doc.data();
                setLastMessage(data.lastMessage || '');
                setLastMessageTimestamp(data.lastMessageTimestamp || null);
            }
        });
        return () => unsubscribe();
    }, [conversation.id]);

    if (!otherUser) {
        return <ConversationSkeleton />;
    }
    
    const isActive = pathname === `/messages/${conversation.id}`;

    return (
        <Link href={`/messages/${conversation.id}`} className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted",
            isActive && "bg-muted"
        )}>
            <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser.photoURL} alt={otherUser.displayName} data-ai-hint="person" />
                <AvatarFallback>{otherUser.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold truncate">{otherUser.displayName}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{formatTimestamp(lastMessageTimestamp)}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
            </div>
        </Link>
    );
};

const ConversationSkeleton = () => (
    <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);


export const ConversationList = ({ conversations, currentUser, loading }: { conversations: ConversationWithUserData[], currentUser: User | null, loading: boolean }) => {
    if (loading) {
        return (
            <div className="p-2 space-y-1">
                {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
            </div>
        )
    }

    if (!currentUser) return null;

    return (
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
                {conversations.length > 0 ? (
                    conversations
                        .sort((a,b) => (b.lastMessageTimestamp?.seconds || 0) - (a.lastMessageTimestamp?.seconds || 0))
                        .map(convo => <ConversationItem key={convo.id} conversation={convo} currentUser={currentUser} />)
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>لا توجد محادثات بعد.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};
