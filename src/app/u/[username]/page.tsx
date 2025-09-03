
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, onSnapshot, runTransaction, DocumentReference, updateDoc, getDoc } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';

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
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4 sm:gap-8 w-full max-w-4xl">
            <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full shrink-0" />
            <div className="flex flex-col items-center sm:items-start space-y-4 flex-grow">
                 <div className='flex flex-col sm:flex-row items-center gap-4 w-full'>
                    <div>
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-5 w-32 mt-2" />
                    </div>
                    <div className='sm:mr-auto'>
                        <Skeleton className="h-9 w-32 rounded-full" />
                    </div>
                </div>
                           
                <div className="flex justify-center sm:justify-start gap-6">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                </div>

                 <div className="max-w-md w-full">
                   <Skeleton className="h-4 w-full max-w-sm mt-2" />
                </div>
            </div>
        </div>
    </div>
);


export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const username = params.username as string;
    const { toast } = useToast();

    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);


    const fetchUserProfile = useCallback(async () => {
        if (!username) return;
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setProfileUser(null);
                setLoading(false);
                return;
            } 
            
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as UserProfile;
            setProfileUser(userData);

            const userDocRef = userDoc.ref;
            
            const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userDocRef.id), orderBy('createdAt', 'desc'));
            const postsSnapshot = await getDocs(postsQuery);
            const postsData = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Post));
            setUserPosts(postsData);

            if (currentUser && currentUser.uid !== userDocRef.id) {
                const followRef = doc(db, 'users', currentUser.uid, 'following', userDocRef.id);
                const followDoc = await getDoc(followRef);
                setIsFollowing(followDoc.exists());
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
            const data = doc.data();
            if (data) {
                setFollowersCount(data.followersCount || 0);
                setFollowingCount(data.followingCount || 0);
                setProfileUser(prev => prev ? { ...prev, ...data } : null);
            }
        });

        return () => unsubscribe();
    }, [profileUser?.uid]);


    const handleProfileUpdate = async (details: { fullName: string; bio: string }, newAvatarFile?: string) => {
        if (!currentUser) return;
        
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const updatedData: Partial<UserProfile> = {
                displayName: details.fullName,
                bio: details.bio,
            };
            if (newAvatarFile) {
                updatedData.photoURL = newAvatarFile;
            }
        
            await updateDoc(userRef, updatedData);
            
            setEditModalOpen(false);
            toast({ title: "تم تحديث الملف الشخصي بنجاح!" });
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({ variant: 'destructive', title: "خطأ", description: "فشل تحديث الملف الشخصي." });
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser || !profileUser || isFollowLoading) return;
        setIsFollowLoading(true);

        const currentUserRef = doc(db, 'users', currentUser.uid);
        const profileUserRef = doc(db, 'users', profileUser.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const followingRef = doc(db, `users/${currentUser.uid}/following/${profileUser.uid}`);
                const followerRef = doc(db, `users/${profileUser.uid}/followers/${currentUser.uid}`);
                
                const profileUserDoc = await transaction.get(profileUserRef);
                const currentUserDoc = await transaction.get(currentUserRef);

                if (!profileUserDoc.exists() || !currentUserDoc.exists()) {
                    throw "User does not exist!";
                }

                const isCurrentlyFollowing = (await transaction.get(followingRef)).exists();
                const currentFollowersCount = profileUserDoc.data().followersCount || 0;
                const currentUserFollowingCount = currentUserDoc.data().followingCount || 0;


                if (isCurrentlyFollowing) { // Unfollow
                    transaction.delete(followingRef);
                    transaction.delete(followerRef);
                    transaction.update(profileUserRef, { followersCount: currentFollowersCount - 1 });
                    transaction.update(currentUserRef, { followingCount: currentUserFollowingCount - 1 });
                    setIsFollowing(false);
                } else { // Follow
                    transaction.set(followingRef, { timestamp: new Date() });
                    transaction.set(followerRef, { timestamp: new Date(), uid: currentUser.uid, username: currentUser.displayName, photoURL: currentUser.photoURL });
                    transaction.update(profileUserRef, { followersCount: currentFollowersCount + 1 });
                    transaction.update(currentUserRef, { followingCount: currentUserFollowingCount + 1 });
                    setIsFollowing(true);
                }
            });

        } catch (error) {
            console.error("Error toggling follow:", error);
            toast({
                variant: 'destructive',
                title: "حدث خطأ",
                description: "لم نتمكن من إتمام العملية. حاول مرة أخرى."
            });
        } finally {
            setIsFollowLoading(false);
        }
    };


    if (loading) {
        return <AppLayout><ProfileSkeleton /></AppLayout>;
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
        <div className="text-center">
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
                 <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
                     <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4 sm:gap-8 w-full max-w-4xl">
                        <Avatar className="w-28 h-28 md:w-36 md:h-36 text-6xl border-4 border-background shadow-lg shrink-0">
                            <AvatarImage src={profileUser.photoURL} alt={profileUser.displayName} data-ai-hint="person" />
                            <AvatarFallback>{profileUser.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col items-center sm:items-start space-y-4 flex-grow">
                            <div className='flex flex-col sm:flex-row items-center gap-4 w-full'>
                                <div>
                                    <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
                                    <p className="text-muted-foreground text-md">@{profileUser.username}</p>
                                </div>
                                <div className='sm:mr-auto'>
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
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button size="sm" className="w-32 rounded-full px-8" variant={isFollowing ? 'outline' : 'default'} onClick={handleFollowToggle} disabled={isFollowLoading}>
                                            {isFollowLoading ? 'جارٍ...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                                        </Button>
                                         <Button size="sm" variant="outline" className="w-32 rounded-full px-8">مراسلة</Button>
                                    </div>
                                )}
                                </div>
                            </div>
                           
                            <div className="flex justify-center sm:justify-start gap-6">
                                <Stat value={userPosts.length} label="منشورات" />
                                <Stat value={followersCount} label="المتابعون" />
                                <Stat value={followingCount} label="يتابع" />
                            </div>

                             <div className="max-w-md w-full">
                               <p className="text-muted-foreground text-sm text-center sm:text-right">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>
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

    