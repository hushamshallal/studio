
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { CreatePost } from '@/components/create-post';
import { Stories } from '@/components/stories';
import { PostCard, Post } from '@/components/post-card';
import { MobileNav } from '@/components/mobile-nav';
import { UserNav } from '@/components/user-nav';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/', iconName: 'Home', label: 'الرئيسية' },
  { href: '#', iconName: 'Search', label: 'استكشاف' },
  { href: '#', iconName: 'Compass', label: 'اكتشف' },
  { href: '#', iconName: 'User', label: 'الملف الشخصي' },
  { href: '#', iconName: 'Users', label: 'المجالس' },
  { href: '#', iconName: 'Mic', label: 'الديوان' },
];

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


export default function AppPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  if (authLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>جار التحميل...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
       <aside className="group fixed top-0 right-0 h-screen flex flex-col border-l bg-sidebar text-sidebar-foreground p-4 pt-8 md:flex transition-all duration-300 ease-in-out w-24 hover:w-80 z-20 hidden">
         <div className="flex flex-col h-full overflow-hidden">
            <h1 className="text-3xl font-headline text-accent px-2 mb-8 transition-all duration-300 group-hover:px-4">
              <span className="group-hover:hidden">س</span>
              <span className="hidden group-hover:inline">سلام</span>
            </h1>
            <nav className="flex flex-col gap-2 flex-1 items-center group-hover:items-stretch">
              {navItems.map((item, index) => {
                const LucideIcon = (Icons as any)[item.iconName];
                const isActive = index === 0;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-full text-lg font-medium transition-colors justify-center group-hover:justify-start',
                      isActive
                        ? 'text-blue-500 font-bold'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    {LucideIcon && <LucideIcon className="h-6 w-6 shrink-0" />}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Button size="lg" className="rounded-full w-14 h-14 text-lg mb-6 font-bold justify-center group-hover:w-full bg-blue-500 hover:bg-blue-600">
                <Icons.Plus className="h-7 w-7 group-hover:ml-2 shrink-0" />
                <span className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 delay-100 whitespace-nowrap">نشر</span>
            </Button>
            <UserNav />
         </div>
      </aside>

      <div className="flex flex-1 md:mr-24">
        <main className="flex-1 border-r border-l max-w-2xl mx-auto w-full">
             <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Icons.Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                    </Button>
                     <Button variant="ghost" size="icon" className="relative rounded-full">
                        <Icons.Mail className="h-5 w-5" />
                         <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">الرئيسية</h1>
                </div>
            </header>
            <div className="p-4 space-y-4">
              <CreatePost />
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
        </main>
        <aside className="w-80 hidden lg:block p-4 flex-shrink-0">
            <div className="sticky top-16">
                 <div className="bg-muted rounded-2xl p-4">
                     <h2 className="font-bold mb-4">أبرز الوسوم</h2>
                     {/* Trends component can go here */}
                </div>
            </div>
        </aside>
      </div>
      <MobileNav navItems={navItems} />
    </div>
  );
}

