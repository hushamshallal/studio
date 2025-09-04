
"use client";

import React, { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Post } from './post/post-types';
import { PostCard } from './post-card';
import { Skeleton } from './ui/skeleton';
import { PenSquare } from 'lucide-react';

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

export function Timeline({ initialPosts }: { initialPosts: Post[] }) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [loading, setLoading] = useState(initialPosts.length === 0);

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                // Convert Firebase Timestamp to a plain number for serialization
                const createdAt = data.createdAt ? (data.createdAt.seconds * 1000 + data.createdAt.nanoseconds / 1000000) : Date.now();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: createdAt,
                } as Post
            });
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-4">
            {loading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            ) : posts.length > 0 ? (
                posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="text-center py-16">
                    <PenSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">ابدأ رحلتك في سلام</h2>
                    <p className="mt-2 text-muted-foreground">تابع الأشخاص وشارك أفكارك لترى آخر المستجدات هنا.</p>
                </div>
            )}
        </div>
    );
}
