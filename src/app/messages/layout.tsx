
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { ConversationList, ConversationWithUserData } from "@/components/conversation-list";
import { useAuth } from "@/context/auth-context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function MessagesLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<ConversationWithUserData[]>([]);
    const [loading, setLoading] = useState(true);

    const isRootMessagesPage = pathname === '/messages';

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participants', 'array-contains', user.uid));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const convos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ConversationWithUserData));
            setConversations(convos);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching conversations: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <AppLayout>
          <div className="flex h-full">
            <aside className={cn(
              "w-full sm:w-80 lg:w-[350px] flex-shrink-0 border-l",
              !isRootMessagesPage && "hidden sm:flex flex-col"
            )}>
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold">الرسائل</h2>
              </div>
              <ConversationList conversations={conversations} currentUser={user} loading={loading} />
            </aside>
            <main className={cn(
                "flex-1",
                isRootMessagesPage && "hidden sm:block"
            )}>
              {children}
            </main>
          </div>
        </AppLayout>
    )
  }
