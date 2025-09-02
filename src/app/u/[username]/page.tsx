
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard, Post } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, List, Settings, Heart, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';
import Link from 'next/link';

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
    isPrivate?: boolean;
    createdAt: any;
}

const ProfileSkeleton = () => (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 max-w-4xl mx-auto">
            <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full shrink-0" />
            <div className="w-full space-y-3 mt-4 sm:mt-0">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
                <div className="flex gap-6">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full sm:w-3/4" />
                </div>
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
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (!username) return;

        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where("username", "==", username));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setProfileUser(null);
                    setLoading(false);
                    return;
                }

                const userData = querySnapshot.docs[0].data() as UserProfile;
                setProfileUser(userData);

                const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userData.uid));
                const unsubscribe = onSnapshot(postsQuery, (postsSnapshot) => {
                    const postsData = postsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Post));
                    
                    postsData.sort((a, b) => {
                        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                        return dateB.getTime() - dateA.getTime();
                    });

                    setUserPosts(postsData);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching posts:", error);
                    setLoading(false);
                });

                return unsubscribe;

            } catch (error) {
                console.error("Error fetching user profile:", error);
                setLoading(false);
            }
        };

        const unsubscribe = fetchUserProfile();

        return () => {
            // This is just a placeholder, the actual unsubscribe is returned and handled by useEffect
        };
    }, [username]);

    const handleProfileUpdate = async (details: { fullName: string; bio: string }, newAvatarFile?: string) => {
        if (!currentUser) return;
        
        const userRef = doc(db, 'users', currentUser.uid);
        const updatedData: Partial<UserProfile> = {
            displayName: details.fullName,
            bio: details.bio,
        };
        
        if (newAvatarFile) {
            updatedData.photoURL = newAvatarFile;
        }
      
        await updateDoc(userRef, updatedData);
        
        setProfileUser(prev => prev ? { ...prev, ...updatedData } : null);
        setEditModalOpen(false);
    };

    if (loading) {
        return <ProfileSkeleton />;
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
    const mediaPosts = userPosts.filter(p => p.mediaUrl);

    const Stat = ({ value, label }: { value: number, label: string }) => (
        <div className="text-center sm:text-left">
            <span className="font-bold text-lg sm:text-base">{value}</span>
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
                <div className="p-4 sm:p-6 lg:p-8">
                     <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-10 max-w-4xl mx-auto">
                        <Avatar className="w-28 h-28 md:w-36 md:h-36 text-6xl border-4 border-background shadow-lg shrink-0">
                            <AvatarImage src={profileUser.photoURL} alt={profileUser.displayName} data-ai-hint="person" />
                            <AvatarFallback>{profileUser.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="w-full flex flex-col items-center sm:items-start space-y-4">
                             {/* Mobile Header */}
                             <div className="sm:hidden text-center space-y-4">
                                <div>
                                    <h1 className="text-xl font-bold">{profileUser.displayName}</h1>
                                    <p className="text-muted-foreground">@{profileUser.username}</p>
                                </div>
                                <div className="flex justify-center gap-6">
                                    <Stat value={userPosts.length} label="منشورات" />
                                    <Stat value={profileUser.followersCount || 0} label="المتابعون" />
                                    <Stat value={profileUser.followingCount || 0} label="يتابع" />
                                </div>
                                <p className="text-muted-foreground text-sm max-w-md">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>
                                {isOwnProfile ? (
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1 rounded-full px-5" onClick={() => setEditModalOpen(true)}>
                                            تعديل الملف
                                        </Button>
                                         <Button variant="ghost" size="icon" className="rounded-full" asChild>
                                            <Link href="/settings">
                                                <Settings className="w-5 h-5" />
                                            </Link>
                                         </Button>
                                    </div>
                                ) : (
                                     <div className="w-full pt-2">
                                        <Button size="sm" className="w-full rounded-full px-8 bg-primary hover:bg-primary/90">متابعة</Button>
                                    </div>
                                )}
                             </div>

                             {/* Desktop Header */}
                            <div className="hidden sm:flex flex-col items-start gap-4 w-full">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-light">@{profileUser.username}</h2>
                                    {isOwnProfile ? (
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="rounded-md px-4" onClick={() => setEditModalOpen(true)}>
                                                تعديل الملف الشخصي
                                            </Button>
                                             <Button variant="ghost" size="icon" className="rounded-md" asChild>
                                                <Link href="/settings">
                                                    <Settings className="w-5 h-5" />
                                                </Link>
                                             </Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" className="rounded-md px-6 bg-primary hover:bg-primary/90">متابعة</Button>
                                    )}
                                </div>
                                
                                <div className="flex justify-start gap-8">
                                    <Stat value={userPosts.length} label="منشورات" />
                                    <Stat value={profileUser.followersCount || 0} label="المتابعون" />
                                    <Stat value={profileUser.followingCount || 0} label="يتابع" />
                                </div>

                                <div>
                                    <h1 className="text-lg font-bold">{profileUser.displayName}</h1>
                                    <p className="text-muted-foreground text-sm mt-1 max-w-md">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sticky top-[65px] z-10 rounded-none bg-background border-y">
                        <TabsTrigger value="grid" className="flex gap-2"><Grid3x3 className="h-5 w-5" /> الصور</TabsTrigger>
                        <TabsTrigger value="list" className="flex gap-2"><List className="h-5 w-5" /> المنشورات</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grid" className="p-1">
                         <div className="grid grid-cols-3 gap-1">
                            {mediaPosts.map(post => (
                                <div key={post.id} className="aspect-square relative group overflow-hidden">
                                    <Image src={post.mediaUrl!} alt="Post media" fill objectFit="cover" className="rounded-sm transition-transform duration-300 group-hover:scale-110" data-ai-hint="social media post" />
                                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {mediaPosts.length === 0 && (
                            <div className="text-center col-span-3 py-10">
                                <Grid3x3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">لا توجد صور</h3>
                                <p className="text-muted-foreground mt-1">عندما تنشر صورًا، ستظهر هنا.</p>
                           </div>
                        )}
                    </TabsContent>
                    <TabsContent value="list" className="space-y-4 p-4 max-w-xl mx-auto">
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
