
"use client";

import React, { useEffect, useState } from 'react';
import { NotificationItem, Notification } from '@/components/notification-item';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface NotificationListProps {
    initialNotifications: Notification[];
    userId: string;
}

export function NotificationList({ initialNotifications, userId }: NotificationListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);

    useEffect(() => {
        if (!userId) return;

        const notificationsRef = collection(db, 'users', userId, 'notifications');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [userId]);
    
    return (
         <div className="divide-y">
            {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
        </div>
    )
}
