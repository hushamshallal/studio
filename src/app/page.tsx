
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Stories } from '@/components/stories';
import { PostCard, Post } from '@/components/post-card';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, orderBy, query, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';
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

const seedUsers = [
    { 
        uid: 'dummy_user_1', 
        displayName: 'علياء', 
        username: 'aliaa', 
        photoURL: 'https://picsum.photos/seed/aliaa/100/100',
        bio: 'مصورة فوتوغرافية ومحبة للطبيعة 📸',
        followersCount: 150,
        followingCount: 75,
    },
    { 
        uid: 'dummy_user_2', 
        displayName: 'بدر', 
        username: 'badr',
        photoURL: 'https://picsum.photos/seed/badr/100/100',
        bio: 'طاهي ومطور ويب 👨‍🍳👨‍💻',
        followersCount: 320,
        followingCount: 180,
    },
    { 
        uid: 'dummy_user_3', 
        displayName: 'جمانة', 
        username: 'jumana',
        photoURL: 'https://picsum.photos/seed/jumana/100/100',
        bio: 'فنانة رقمية وعاشقة للقطط 🎨🐾',
        followersCount: 890,
        followingCount: 250,
    },
];

const seedPosts = [
    {
        authorId: 'dummy_user_1',
        content: 'يوم جميل في الجبال! الطبيعة دائمًا تلهم. #تصوير #طبيعة',
        mediaUrl: 'https://picsum.photos/600/400?random=1',
        mediaType: 'image',
    },
    {
        authorId: 'dummy_user_1',
        content: 'ما هو كتابكم المفضل لهذا العام؟ أبحث عن توصيات جديدة.',
    },
    {
        authorId: 'dummy_user_2',
        content: 'أشارككم اليوم وصفتي للبيتزا الإيطالية. بسيطة ولذيذة! 🍕 #طبخ #وصفات',
        mediaUrl: 'https://picsum.photos/400/600?random=2',
        mediaType: 'image',
    },
    {
        authorId: 'dummy_user_2',
        content: 'قضيت اليوم في كتابة كود لمشروع جديد ومثير. قريباً سأشارككم المزيد من التفاصيل!',
    },
    {
        authorId: 'dummy_user_3',
        content: 'لوحة فنية جديدة مستوحاة من أحلام الليل. ما رأيكم؟ #فن_رقمي',
        mediaUrl: 'https://picsum.photos/600/400?random=3',
        mediaType: 'image',
    },
    {
        authorId: 'dummy_user_3',
        content: 'أحيانًا تكون أفضل الخطط هي عدم وجود خطة على الإطلاق.',
    },
];


export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Seed data if posts collection is empty
    const seedData = async () => {
        const postsCollection = collection(db, 'posts');
        const snapshot = await getDocs(query(postsCollection, orderBy('createdAt', 'desc')));
        if (snapshot.empty) {
            console.log("No posts found, seeding data...");
            const batch = writeBatch(db);

            // Seed users
            seedUsers.forEach(u => {
                const userRef = doc(db, 'users', u.uid);
                batch.set(userRef, {
                    ...u,
                    email: `${u.username}@example.com`,
                    createdAt: serverTimestamp(),
                });
            });

            // Seed posts
            seedPosts.forEach(p => {
                const postRef = doc(collection(db, 'posts'));
                const author = seedUsers.find(u => u.uid === p.authorId);
                if (author) {
                     batch.set(postRef, {
                        ...p,
                        authorName: author.displayName,
                        authorHandle: author.username,
                        authorAvatar: author.photoURL,
                        likes: Math.floor(Math.random() * 200),
                        comments: Math.floor(Math.random() * 50),
                        createdAt: serverTimestamp(),
                    });
                }
            });

            try {
                await batch.commit();
                console.log("Dummy data seeded successfully.");
            } catch(e) {
                console.error("Error seeding data: ", e);
            }
        }
    };
    
    seedData();

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

    return () => unsubscribe();
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
        </div>
    </AppLayout>
  );
}
