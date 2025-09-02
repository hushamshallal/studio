
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { CreatePost } from '@/components/create-post';
import { MobileNav } from '@/components/mobile-nav';
import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
        const fetchUsername = async () => {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUsername(userDoc.data().username);
            }
        };
        fetchUsername();
    }
  }, [user, authLoading, router]);

  const navItems = [
    { href: '/', iconName: 'Home', label: 'الرئيسية' },
    { href: '/explore', iconName: 'Compass', label: 'استكشاف' },
    { href: `/u/${username}`, iconName: 'User', label: 'الملف الشخصي', disabled: !username },
    { href: '#', iconName: 'Users', label: 'المجالس' },
    { href: '#', iconName: 'Mic', label: 'الديوان' },
  ];

  if (authLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>جار التحميل...</p>
        </div>
    );
  }

  const getPageTitle = () => {
    if (pathname === '/') return 'الرئيسية';
    if (pathname === '/explore') return 'استكشاف';
    if (pathname.startsWith('/u/')) return 'الملف الشخصي';
    if (pathname === '/notifications') return 'الإشعارات';
    if (pathname === '/messages') return 'الرسائل';
    return 'سلام';
  }

  return (
    <Dialog open={isCreatePostOpen} onOpenChange={setCreatePostOpen}>
      <div className="flex min-h-screen bg-background">
         <aside 
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
            className={cn(
              "group fixed top-0 right-0 h-screen flex-col border-l bg-sidebar text-sidebar-foreground p-2 pt-4 z-20 transition-all duration-300 ease-in-out hidden sm:flex",
              isSidebarExpanded ? 'w-80' : 'w-24'
            )}
          >
           <div className="flex flex-col h-full overflow-hidden">
              <h1 className={cn("text-3xl font-headline text-primary px-2 mb-8 transition-all duration-300", isSidebarExpanded ? "px-4" : "px-2 text-center")}>
                <Link href="/">
                  <span className={cn(!isSidebarExpanded && "hidden")}>سلام</span>
                  <span className={cn(isSidebarExpanded && "hidden")}>س</span>
                </Link>
              </h1>
              <nav className="flex flex-col gap-2 flex-1 items-stretch">
                {navItems.map((item) => {
                  const LucideIcon = (Icons as any)[item.iconName];
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.disabled ? '#' : item.href}
                      title={!isSidebarExpanded ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-full text-lg transition-colors',
                        isSidebarExpanded ? 'justify-start' : 'justify-center',
                        isActive
                          ? 'text-blue-500 font-bold'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary-foreground',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {LucideIcon && <LucideIcon className={cn("h-6 w-6 shrink-0", isActive && "text-blue-500")} />}
                      <span className={cn("whitespace-nowrap transition-opacity duration-200", !isSidebarExpanded && "opacity-0 hidden")}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-1 my-4">
                <DialogTrigger asChild>
                  <Button size="lg" className={cn("w-full rounded-full h-14 text-lg mb-6 font-bold bg-blue-500 hover:bg-blue-600 flex items-center", isSidebarExpanded ? "justify-start px-4" : "justify-center")}>
                      <Icons.Plus className="h-7 w-7 shrink-0" />
                      <span className={cn("transition-opacity duration-200 mr-2", !isSidebarExpanded && "opacity-0 hidden")}>نشر</span>
                  </Button>
                </DialogTrigger>
              </div>
              <UserNav isExpanded={isSidebarExpanded} />
           </div>
        </aside>

        <div className={cn("flex flex-1 transition-all duration-300 ease-in-out sm:mr-24")}>
          <main className="flex-1 border-r border-l max-w-2xl mx-auto w-full">
               <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                  <div className="flex items-center gap-4">
                      <h1 className="text-xl font-bold">{getPageTitle()}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full">
                                <Icons.Bell className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-80 mt-2" align="end">
                            <DropdownMenuLabel className="font-bold">الإشعارات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              <p>لا توجد إشعارات جديدة.</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/notifications" className="flex items-center justify-center cursor-pointer">
                                    عرض كل الإشعارات
                                </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative rounded-full">
                                    <Icons.Mail className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 mt-2" align="end">
                                <DropdownMenuLabel className="font-bold">الرسائل</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    <p>لا توجد رسائل جديدة.</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/messages" className="flex items-center justify-center cursor-pointer">
                                        عرض الكل في الرسائل
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                  </div>
              </header>
              {children}
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

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء منشور جديد</DialogTitle>
          </DialogHeader>
          <CreatePost onPostCreated={() => setCreatePostOpen(false)} />
        </DialogContent>
      </div>
    </Dialog>
  );
}
