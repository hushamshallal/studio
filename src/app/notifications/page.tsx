
"use client";

import React from 'react';
import { NotificationItem, Notification } from '@/components/notification-item';

export default function NotificationsPage() {
    const notifications: Notification[] = [];

    return (
        <>
            {notifications && notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-lg font-semibold">لا توجد إشعارات</p>
                    <p className="text-muted-foreground">عندما يتابعك أحد أو يتفاعل مع منشوراتك، ستظهر إشعاراتك هنا.</p>
                </div>
            )}
        </>
    );
};
