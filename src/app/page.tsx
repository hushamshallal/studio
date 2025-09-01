
"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePost } from '@/components/create-post';
import { Stories } from '@/components/stories';
import { PostCard } from '@/components/post-card';
import { MobileNav } from '@/components/mobile-nav';
import { UserNav } from '@/components/user-nav';


const navItems = [
  { href: '/', iconName: 'Home', label: 'الرئيسية' },
  { href: '#', iconName: 'Search', label: 'استكشاف' },
  { href: '#', iconName: 'Clapperboard', label: 'ريلز' },
  { href: '#', iconName: 'User', label: 'الملف الشخصي' },
  { href: '#', iconName: 'Users', label: 'المجالس' },
  { href: '#', iconName: 'Mic', label: 'الديوان' },
];

const dummyPosts = [
    {
      username: 'سارة عبدالله',
      userhandle: '@sara_abdullah',
      avatarUrl: 'https://picsum.photos/seed/sara/100/100',
      time: 'قبل ٥ دقائق',
      content: 'يوم جميل في #الرياض! الأجواء رائعة اليوم. من منكم يستمتع بالجو؟ @ahmed',
      mediaUrl: 'https://picsum.photos/600/400?a',
      mediaType: 'image',
      likes: 15,
      comments: 4,
    },
    {
      username: 'أحمد محمد',
      userhandle: '@ahmed_mohamed',
      avatarUrl: 'https://picsum.photos/seed/ahmed/100/100',
      time: 'قبل ساعة',
      content: 'أخيرًا انتهيت من قراءة كتاب "فن اللامبالاة". كتاب رائع ومغير للحياة، أنصح به الجميع. #كتب #تطوير_الذات',
      likes: 32,
      comments: 8,
    },
    {
      username: 'فاطمة علي',
      userhandle: '@fatima_ali',
      avatarUrl: 'https://picsum.photos/seed/fatima/100/100',
      time: 'قبل ٣ ساعات',
      content: 'مقطع فيديو قصير من رحلتي الأخيرة إلى #العلا. الطبيعة هنا تأسر القلوب!',
      mediaUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      mediaType: 'video',
      likes: 50,
      comments: 12,
    },
  ];


export default function AppPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>جار التحميل...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
       <aside className="fixed top-0 right-0 h-screen w-64 flex-col border-l bg-background p-4 pt-8 hidden md:flex">
         <div className="flex flex-col h-full">
            <h1 className="text-3xl font-headline text-accent px-4 mb-8">سلام</h1>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item, index) => {
                const LucideIcon = (Icons as any)[item.iconName];
                const isActive = index === 0;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-4 p-3 rounded-full text-lg font-medium transition-colors ${
                      isActive
                        ? 'text-foreground font-bold'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {LucideIcon && <LucideIcon className="h-6 w-6" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Button size="lg" className="rounded-full w-full text-lg h-12 mb-6">
                <Icons.Plus className="h-6 w-6 ml-2" />
                <span>نشر</span>
            </Button>
            <UserNav />
         </div>
      </aside>

      <div className="flex flex-1 md:mr-64">
        <main className="flex-1 border-r">
             <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="relative">
                        <Icons.Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                    </Button>
                     <Button variant="ghost" size="icon" className="relative">
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
                {dummyPosts.map((post, index) => (
                  <PostCard key={index} {...post} />
                ))}
              </div>
            </div>
        </main>
        <aside className="w-80 hidden lg:block p-4">
            <div className="sticky top-16">
                 <div className="bg-muted rounded-lg p-4">
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

