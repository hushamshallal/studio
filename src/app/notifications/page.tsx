
import React from 'react';
import { NotificationItem, Notification, NotificationSkeleton } from '@/components/notification-item';
import { BellOff } from 'lucide-react';
import { getDocs, collection, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { headers } from 'next/headers';
import { getUidFromCookie } from '@/lib/firebase/server-auth';
import { NotificationList } from '@/components/notification-list';

async function getNotifications(uid: string) {
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    // Mark notifications as read on the server
    const unreadNotifs = snapshot.docs.filter(doc => !doc.data().isRead);
    if (unreadNotifs.length > 0) {
        const batch = writeBatch(db);
        unreadNotifs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}


export default async function NotificationsPage() {
    const uid = await getUidFromCookie();
    
    if (!uid) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <BellOff className="h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">الرجاء تسجيل الدخول</p>
                <p className="text-muted-foreground">يجب عليك تسجيل الدخول لعرض الإشعارات.</p>
            </div>
        )
    }

    const initialNotifications = await getNotifications(uid);


    return (
        <>
            {initialNotifications && initialNotifications.length > 0 ? (
                <NotificationList initialNotifications={initialNotifications} userId={uid} />
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
