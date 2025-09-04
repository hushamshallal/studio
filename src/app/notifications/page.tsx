
"use client";

import React, { useEffect, useState } from 'react';
import { NotificationItem, Notification, NotificationSkeleton } from '@/components/notification-item';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDocs, writeBatch } from 'firebase/firestore';
import { BellOff } from 'lucide-react';

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const notificationsRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifs);
            setLoading(false);

            // Mark notifications as read
            const unreadNotifs = snapshot.docs.filter(doc => !doc.data().isRead);
            if (unreadNotifs.length > 0) {
                const batch = writeBatch(db);
                unreadNotifs.forEach(doc => {
                    batch.update(doc.ref, { isRead: true });
                });
                await batch.commit();
            }
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="divide-y">
                {Array.from({ length: 7 }).map((_, i) => <NotificationSkeleton key={i} />)}
            </div>
        )
    }

    return (
        <>
            {notifications && notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BellOff className="h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">لا توجد إشعارات بعد</p>
                    <p className="text-muted-foreground">عندما يتابعك أحد أو يتفاعل مع منشوراتك، ستظهر إشعاراتك هنا.</p>
                </div>
            )}
        </>
    );
};
