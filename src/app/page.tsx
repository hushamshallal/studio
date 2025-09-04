
import React from 'react';
import { Stories } from '@/components/stories';
import { PostCard } from '@/components/post-card';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, orderBy, query, getDocs, writeBatch, doc, serverTimestamp, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/app-layout';
import { PenSquare } from 'lucide-react';
import { Timeline } from '@/components/timeline';
import type { Post } from '@/components/post/post-types';

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
        uid: 'user_aliaa', 
        displayName: 'علياء', 
        username: 'aliaa', 
        photoURL: 'https://picsum.photos/seed/aliaa/100/100',
        bio: 'مصورة فوتوغرافية ومحبة للطبيعة 📸',
        followersCount: 150,
        followingCount: 75,
    },
    { 
        uid: 'user_badr', 
        displayName: 'بدر', 
        username: 'badr',
        photoURL: 'https://picsum.photos/seed/badr/100/100',
        bio: 'طاهي ومطور ويب 👨‍🍳👨‍💻',
        followersCount: 320,
        followingCount: 180,
    },
    { 
        uid: 'user_jumana', 
        displayName: 'جمانة', 
        username: 'jumana',
        photoURL: 'https://picsum.photos/seed/jumana/100/100',
        bio: 'فنانة رقمية وعاشقة للقطط 🎨🐾',
        followersCount: 890,
        followingCount: 250,
    },
     { 
        uid: 'user_sami', 
        displayName: 'سامي', 
        username: 'sami',
        photoURL: 'https://picsum.photos/seed/sami/100/100',
        bio: 'مهندس برمجيات شغوف بالذكاء الاصطناعي.',
        followersCount: 450,
        followingCount: 120,
    },
    { 
        uid: 'user_layla', 
        displayName: 'ليلى', 
        username: 'layla',
        photoURL: 'https://picsum.photos/seed/layla/100/100',
        bio: 'مصممة أزياء ومؤسسة علامة تجارية محلية.',
        followersCount: 1200,
        followingCount: 300,
    },
];

const seedPosts = [
    {
        authorId: 'user_aliaa',
        content: 'يوم جميل في الجبال! الطبيعة دائمًا تلهم. #تصوير #طبيعة',
        mediaUrl: 'https://picsum.photos/600/400?random=1',
        mediaType: 'image',
    },
    {
        authorId: 'user_aliaa',
        content: 'ما هو كتابكم المفضل لهذا العام؟ أبحث عن توصيات جديدة.',
    },
    {
        authorId: 'user_badr',
        content: 'أشارككم اليوم وصفتي للبيتزا الإيطالية. بسيطة ولذيذة! 🍕 #طبخ #وصفات',
        mediaUrl: 'https://picsum.photos/400/600?random=2',
        mediaType: 'image',
    },
    {
        authorId: 'user_badr',
        content: 'قضيت اليوم في كتابة كود لمشروع جديد ومثير. قريباً سأشارككم المزيد من التفاصيل!',
    },
    {
        authorId: 'user_jumana',
        content: 'لوحة فنية جديدة مستوحاة من أحلام الليل. ما رأيكم؟ #فن_رقمي',
        mediaUrl: 'https://picsum.photos/600/400?random=3',
        mediaType: 'image',
    },
    {
        authorId: 'user_jumana',
        content: 'أحيانًا تكون أفضل الخطط هي عدم وجود خطة على الإطلاق.',
    },
    {
        authorId: 'user_sami',
        content: 'متحمس جدًا لإمكانيات نماذج اللغة الكبيرة في تغيير طريقة تفاعلنا مع التكنولوجيا. #AI #مستقبل_التقنية',
    },
    {
        authorId: 'user_sami',
        content: 'هل يوجد أفضل من قضاء المساء في حل مشكلة برمجية معقدة؟ #تحدي_برمجي',
        mediaUrl: 'https://picsum.photos/600/400?random=4',
        mediaType: 'image',
    },
    {
        authorId: 'user_layla',
        content: 'نظرة خاطفة على مجموعتي الجديدة! الألوان الترابية تسيطر على هذا الموسم. #موضة #تصميم',
        mediaUrl: 'https://picsum.photos/400/600?random=5',
        mediaType: 'image',
    },
    {
        authorId: 'user_layla',
        content: 'الإلهام يمكن أن يأتي من أي مكان. اليوم، جاء من نمط بلاط قديم في مقهى.',
    },
];

async function getPosts(): Promise<Post[]> {
     // Seed data if posts collection is empty
    const postsCollection = collection(db, 'posts');
    const qSeedCheck = query(postsCollection, limit(1));
    const snapshot = await getDocs(qSeedCheck);
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
    
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firebase Timestamp to a plain number for serialization
        const createdAt = data.createdAt ? (data.createdAt.seconds * 1000 + data.createdAt.nanoseconds / 1000000) : Date.now();
        return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
        } as Post;
    });
}


export default async function HomePage() {
  const initialPosts = await getPosts();

  return (
    <AppLayout>
        <div className="p-4 space-y-4">
          <Stories />
          <Timeline initialPosts={initialPosts} />
        </div>
    </AppLayout>
  );
}
