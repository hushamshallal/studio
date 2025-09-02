
"use client";

import React from 'react';
import { NotificationItem, Notification } from '@/components/notification-item';

// Mock data - replace with actual data from Firebase
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'سعود القحطاني',
      avatarUrl: 'https://picsum.photos/seed/sattam/100/100',
    },
    postContent: 'صورة جميلة! أين تم التقاطها؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: 'فاطمة الزهراء',
      avatarUrl: 'https://picsum.photos/seed/fatima/100/100',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    user: {
      name: 'محمد الغامدي',
      avatarUrl: 'https://picsum.photos/seed/mohammed/100/100',
    },
    postContent: 'أتفق معك تماماً، تحليل رائع.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
  },
  {
    id: '4',
    type: 'mention',
    user: {
      name: 'نورة عبدالله',
      avatarUrl: 'https://picsum.photos/seed/noura/100/100',
    },
    postContent: 'مرحباً @username، هل رأيت هذا الخبر؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
  },
];


export default function NotificationsPage() {
    // In a real app, you would fetch notifications and handle marking them as read.
    // const [notifications, setNotifications] = useState<Notification[]>([]);
    // useEffect(() => { ... fetch notifications logic ... }, []);

    const notifications = mockNotifications;

    return (
        <AppLayout>
            {notifications && notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            ) : (
                <p className="p-8 text-center text-muted-foreground">لا توجد إشعارات بعد.</p>
            )}
        </AppLayout>
    );
};
