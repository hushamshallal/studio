
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import AppLayout from '@/components/layout/app-layout';
import { Post } from '@/components/post/post-types';
import { ProfileHeader, ProfileHeaderSkeleton } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';

export type UserProfileData = {
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    isPrivate?: boolean;
    createdAt: any;
}

export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const username = params.username as string;
    const { toast } = useToast();

    const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        if (!username || !currentUser) return;
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setProfileUser(null);
            } else {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data() as UserProfileData
                setProfileUser(userData);

                const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userDoc.id));
                const postsSnapshot = await getDocs(postsQuery);
                const postsData = postsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt ? (data.createdAt.seconds * 1000 + data.createdAt.nanoseconds / 1000000) : Date.now(),
                    } as Post
                });
                postsData.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
                setUserPosts(postsData);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({ variant: 'destructive', title: "خطأ", description: "فشل تحميل الملف الشخصي." });
        } finally {
            setLoading(false);
        }
    }, [username, currentUser, toast]);
    
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        if (!profileUser?.uid) return;

        const userDocRef = doc(db, 'users', profileUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setProfileUser(prev => prev ? { ...prev, ...doc.data() } as UserProfileData : null);
            }
        });

        return () => unsubscribe();
    }, [profileUser?.uid]);

    if (loading) {
        return <AppLayout><ProfileHeaderSkeleton /></AppLayout>;
    }

    if (!profileUser) {
        return (
            <AppLayout>
                <div className="text-center p-10">
                    <h2 className="text-2xl font-bold">المستخدم غير موجود</h2>
                    <p className="text-muted-foreground">لم نتمكن من العثور على المستخدم @{username}</p>
                </div>
            </AppLayout>
        )
    }
    
    const isOwnProfile = currentUser?.uid === profileUser.uid;

    return (
        <AppLayout>
            <div className="w-full">
                <ProfileHeader 
                    profileUser={profileUser} 
                    currentUser={currentUser!} 
                    isOwnProfile={isOwnProfile}
                    postsCount={userPosts.length}
                />
                <ProfileTabs userPosts={userPosts} />
            </div>
        </AppLayout>
    );
};
