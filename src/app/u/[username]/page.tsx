
"use client";

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard, Post } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';

type UserProfile = {
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL: string;
    coverURL?: string;
    bio?: string;
    createdAt: any;
}

const ProfileSkeleton = () => (
    <div>
        <Skeleton className="h-48 md:h-56 w-full" />
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div className="-mt-20 md:-mt-24">
                    <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-background" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="mt-2 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full max-w-lg" />
            </div>
            <div className="flex space-x-6 rtl:space-x-reverse my-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
            </div>
        </div>
    </div>
);


export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const username = params.username as string;

    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!username) return;
            try {
                setLoading(true);
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where("username", "==", username));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setProfileUser(null);
                    return;
                }

                const userData = querySnapshot.docs[0].data() as UserProfile;
                setProfileUser(userData);

                // Fetch user posts
                const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userData.uid));
                const postsSnapshot = await getDocs(postsQuery);
                const postsData = postsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Post));
                setUserPosts(postsData);

            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [username]);

    if (loading) {
        return (
          <AppLayout>
            <ProfileSkeleton />
          </AppLayout>
        )
    }

    if (!profileUser) {
        return notFound();
    }
    
    const isOwnProfile = currentUser?.uid === profileUser.uid;

    const Stat = ({ value, label }: { value: number, label: string }) => (
        <div className={`text-center transition-colors`}>
            <span className="font-bold text-lg">{value}</span>
            <span className="text-sm text-muted-foreground ms-1">{label}</span>
        </div>
    );

    return (
        <AppLayout>
            <div>
                <div className="border-b">
                    <div
                        className="h-48 md:h-56 bg-cover bg-center relative bg-muted"
                    >
                       {profileUser.coverURL && <Image src={profileUser.coverURL} alt="Cover photo" layout="fill" objectFit="cover" />}
                    </div>

                    <div className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="-mt-20 md:-mt-24">
                                 <Avatar className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-background">
                                    <AvatarImage src={profileUser.photoURL} data-ai-hint="person" />
                                    <AvatarFallback>{profileUser.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            
                            <div className="pt-2 flex items-center space-x-2 rtl:space-x-reverse">
                                {isOwnProfile ? (
                                    <Button variant="outline" className="rounded-full px-6">تعديل الملف</Button>
                                ) : (
                                    <Button className="rounded-full px-6 bg-blue-500 hover:bg-blue-600">متابعة</Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-2">
                            <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
                            <p className="text-muted-foreground">@{profileUser.username}</p>
                            <p className="mt-2 text-sm max-w-lg">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>
                        </div>

                        <div className="flex space-x-6 rtl:space-x-reverse my-4">
                            <Stat value={userPosts.length} label="منشورات" />
                            <Stat value={0} label="المتابعون" />
                            <Stat value={0} label="يتابع" />
                        </div>
                    </div>
                </div>
                
                <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sticky top-[65px] z-10 rounded-none bg-background border-b">
                        <TabsTrigger value="grid" className="flex gap-2"><Grid3x3 className="h-5 w-5" /> الشبكة</TabsTrigger>
                        <TabsTrigger value="list" className="flex gap-2"><List className="h-5 w-5" /> كتابات</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grid" className="p-2">
                         <div className="grid grid-cols-3 gap-1">
                            {userPosts.filter(p => p.mediaUrl).map(post => (
                                <div key={post.id} className="aspect-square relative">
                                    <Image src={post.mediaUrl!} alt="Post media" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="social media post" />
                                </div>
                            ))}
                        </div>
                         {userPosts.filter(p => p.mediaUrl).length === 0 && (
                            <p className="text-center text-muted-foreground col-span-3 py-10">لا توجد صور أو فيديوهات لعرضها.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="list" className="space-y-4 p-4">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                            <p className="text-center text-muted-foreground py-10">لا توجد منشورات لعرضها.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};
