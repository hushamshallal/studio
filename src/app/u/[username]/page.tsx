
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard, Post } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, List, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';

type UserProfile = {
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    createdAt: any;
}

const ProfileSkeleton = () => (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-6">
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
        <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-full max-w-md text-center" />
        <div className="flex space-x-8 rtl:space-x-reverse">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
    </div>
);


export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const username = params.username as string;

    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

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
            const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userData.uid), where("mediaUrl", "!=", null));
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

    useEffect(() => {
        fetchUserProfile();
    }, [username]);

    const handleProfileUpdate = async (details: { fullName: string; bio: string }, newAvatarUrl?: string) => {
      if (!profileUser) return;
      
      const userRef = doc(db, 'users', profileUser.uid);
      const updatedData: Partial<UserProfile> = {
          displayName: details.fullName,
          bio: details.bio,
      };
      if (newAvatarUrl) {
          updatedData.photoURL = newAvatarUrl;
      }
      
      await updateDoc(userRef, updatedData);
      
      // Refresh data
      fetchUserProfile();
    };

    if (loading) {
        return (
          <AppLayout>
            <ProfileSkeleton />
          </AppLayout>
        )
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

    const Stat = ({ value, label }: { value: number, label: string }) => (
        <div className="text-center transition-colors">
            <span className="font-bold text-lg">{value}</span>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );

    return (
        <AppLayout>
            {isOwnProfile && profileUser && (
                <EditProfileModal
                    user={profileUser}
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}
            <div className="w-full">
                <div className="flex flex-col items-center p-4 md:p-8 space-y-4 border-b">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 text-6xl border-4 border-background shadow-md">
                        <AvatarImage src={profileUser.photoURL} alt={profileUser.displayName} data-ai-hint="person" />
                        <AvatarFallback>{profileUser.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
                        <p className="text-muted-foreground">@{profileUser.username}</p>
                    </div>

                    <p className="max-w-md text-center text-sm">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>

                    <div className="flex space-x-8 rtl:space-x-reverse my-4">
                        <Stat value={userPosts.length} label="منشورات" />
                        <Stat value={profileUser.followersCount || 0} label="المتابعون" />
                        <Stat value={profileUser.followingCount || 0} label="يتابع" />
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {isOwnProfile ? (
                            <Button variant="outline" className="rounded-full px-8" onClick={() => setEditModalOpen(true)}>
                                تعديل الملف
                            </Button>
                        ) : (
                            <>
                                <Button className="rounded-full px-8 bg-blue-500 hover:bg-blue-600">متابعة</Button>
                                <Button variant="outline" className="rounded-full px-8">مراسلة</Button>
                            </>
                        )}
                    </div>
                </div>
                
                <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sticky top-[65px] z-10 rounded-none bg-background border-b">
                        <TabsTrigger value="grid" className="flex gap-2"><Grid3x3 className="h-5 w-5" /> الصور</TabsTrigger>
                        <TabsTrigger value="list" className="flex gap-2"><List className="h-5 w-5" /> المنشورات</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grid" className="p-1">
                         <div className="grid grid-cols-3 gap-1">
                            {userPosts.filter(p => p.mediaUrl).map(post => (
                                <div key={post.id} className="aspect-square relative group overflow-hidden">
                                    <Image src={post.mediaUrl!} alt="Post media" layout="fill" objectFit="cover" className="rounded-sm transition-transform duration-300 group-hover:scale-110" data-ai-hint="social media post" />
                                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {userPosts.filter(p => p.mediaUrl).length === 0 && (
                            <div className="text-center col-span-3 py-10">
                                <Grid3x3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">لا توجد صور</h3>
                                <p className="text-muted-foreground mt-1">عندما تنشر صورًا، ستظهر هنا.</p>
                           </div>
                        )}
                    </TabsContent>
                    <TabsContent value="list" className="space-y-4 p-4">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                             <div className="text-center col-span-3 py-10">
                                <List className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">لا توجد منشورات</h3>
                                <p className="text-muted-foreground mt-1">عندما تنشر شيئًا، ستظهر منشوراتك هنا.</p>
                           </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

    