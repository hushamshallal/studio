
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, runTransaction, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { UserProfileData } from '@/app/u/[username]/page';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Stat = ({ value, label }: { value: number, label: string }) => (
    <div className="text-center">
        <span className="font-bold text-lg">{value}</span>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);

export const ProfileHeaderSkeleton = () => (
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
                           
                <div className="max-w-md w-full">
                   <Skeleton className="h-4 w-full max-w-sm mt-2" />
                </div>

                <div className="flex justify-center sm:justify-start gap-6">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                </div>

            </div>
        </div>
    </div>
);


interface ProfileHeaderProps {
    profileUser: UserProfileData;
    currentUser: User;
    isOwnProfile: boolean;
    postsCount: number;
}

export const ProfileHeader = ({ profileUser, currentUser, isOwnProfile, postsCount }: ProfileHeaderProps) => {
    const { toast } = useToast();
    const router = useRouter();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    
    useEffect(() => {
        if (!currentUser || isOwnProfile) return;

        const checkFollowing = async () => {
            const followRef = doc(db, 'users', currentUser.uid, 'following', profileUser.uid);
            const followDoc = await getDoc(followRef);
            setIsFollowing(followDoc.exists());
        };
        checkFollowing();
    }, [currentUser, profileUser, isOwnProfile]);


    const handleProfileUpdate = async (details: { fullName: string; bio: string }, newAvatarFile?: string) => {
        if (!currentUser) return;
        
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const updatedData: Partial<UserProfileData> = {
                displayName: details.fullName,
                bio: details.bio,
            };
            if (newAvatarFile) {
                updatedData.photoURL = newAvatarFile;
            }
        
            await runTransaction(db, async (transaction) => {
                transaction.update(userRef, updatedData);
            });
            
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

    const handleSendMessage = async () => {
        if (!currentUser || !profileUser) return;
    
        const conversationId = [currentUser.uid, profileUser.uid].sort().join('_');
        const conversationRef = doc(db, 'conversations', conversationId);
    
        try {
            const docSnap = await getDoc(conversationRef);
            if (!docSnap.exists()) {
                await setDoc(conversationRef, {
                    participants: [currentUser.uid, profileUser.uid],
                    lastMessage: `بدأت المحادثة`,
                    lastMessageSender: currentUser.uid,
                    lastMessageTimestamp: serverTimestamp(),
                }, { merge: true });
            }
            router.push(`/messages/${conversationId}`);
        } catch (error) {
            console.error("Error creating/navigating to conversation:", error);
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'لم نتمكن من بدء المحادثة.'
            });
        }
    };

    return (
        <>
            {isOwnProfile && (
                <EditProfileModal
                    user={profileUser}
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center border-b">
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
                                     <Button size="sm" variant="outline" className="w-32 rounded-full px-8" onClick={handleSendMessage}>
                                         <MessageSquare className="ml-2 h-4 w-4" />
                                         مراسلة
                                     </Button>
                                </div>
                            )}
                            </div>
                        </div>
                       
                         <div className="max-w-md w-full">
                           <p className="text-muted-foreground text-sm text-center sm:text-right">{profileUser.bio || "لا يوجد وصف تعريفي."}</p>
                        </div>

                        <div className="flex justify-center sm:justify-start gap-6">
                            <Stat value={postsCount || 0} label="منشورات" />
                            <Stat value={profileUser.followersCount || 0} label="المتابعون" />
                            <Stat value={profileUser.followingCount || 0} label="يتابع" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
