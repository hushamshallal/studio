
"use client";

import React from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3x3, List, Heart, MessageCircle } from 'lucide-react';
import { PostCard } from '@/components/post/post-card';
import { Post } from '@/components/post/post-types';

export const ProfileTabs = ({ userPosts }: { userPosts: Post[] }) => {
    const mediaPosts = userPosts.filter(p => p.mediaUrl);

    return (
        <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sticky top-[64px] z-10 rounded-none bg-background border-b">
                <TabsTrigger value="list" className="flex gap-2"><List className="h-5 w-5" /> المنشورات</TabsTrigger>
                <TabsTrigger value="grid" className="flex gap-2"><Grid3x3 className="h-5 w-5" /> الصور</TabsTrigger>
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
    );
};
