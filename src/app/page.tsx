
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Stories } from '@/components/stories';
import { PostCard, Post } from '@/components/post-card';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';

const PostSkeleton = () => (
    <div className="p-4 border rounded-xl space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-48 w-full rounded-lg" />
    </div>
);


export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Don't fetch posts if there's no user

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Post));
        setPosts(postsData);
        setPostsLoading(false);
    }, (error) => {
        console.error("Error fetching posts:", error);
        setPostsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user]);

  return (
    <AppLayout>
        <div className="p-4 space-y-4">
          <Stories />
          <div className="space-y-4">
            {postsLoading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            ) : (
                posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
          </div>
        </div>
    </AppLayout>
  );
}
