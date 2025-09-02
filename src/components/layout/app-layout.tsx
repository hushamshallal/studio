
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
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [username, setUsername] = useState('');
  const { toast } = useToast();

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

  const showComingSoonToast = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
        title: "قريباً...",
        description: "هذه الميزة قيد التطوير حالياً.",
        duration: 3000,
    })
  }

  const navItems = [
    { href: '/', iconName: 'Home', label: 'الرئيسية' },
    { href: '/explore', iconName: 'Compass', label: 'استكشاف' },
    { href: '/reels', iconName: 'Clapperboard', label: 'ريلز' },
    { href: `/u/${username}`, iconName: 'User', label: 'الملف الشخصي', disabled: !username },
    { href: '#', iconName: 'Users', label: 'المجالس', onClick: showComingSoonToast },
    { href: '#', iconName: 'Mic', label: 'الديوان', onClick: showComingSoonToast },
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
    if (pathname.startsWith('/messages')) return 'الرسائل';
    if (pathname === '/reels') return 'ريلز';
    if (pathname === '/settings') return 'الإعدادات';
    return 'سلام';
  }

  const pageTitle = getPageTitle();

  return (
    <Dialog open={isCreatePostOpen} onOpenChange={setCreatePostOpen}>
      <div className="flex min-h-screen bg-background">
         <aside 
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
            className={cn(
              "group fixed top-0 right-0 h-screen flex-col border-l bg-sidebar text-sidebar-foreground p-2 pt-4 z-20 transition-all duration-300 ease-in-out hidden sm:flex",
              isSidebarExpanded ? 'w-64' : 'w-20'
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
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  const commonProps = {
                    title: !isSidebarExpanded ? item.label : undefined,
                    className: cn(
                        'flex items-center gap-4 p-3 rounded-full text-lg transition-colors',
                        isSidebarExpanded ? 'justify-start px-4' : 'justify-center',
                        isActive
                          ? 'text-primary bg-primary/10 font-bold'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      ),
                      onClick: item.onClick
                  };

                  const key = `nav-${item.label}`;

                  return item.href === '#' || item.disabled ? (
                      <button key={key} {...commonProps} disabled={item.disabled}>
                          {LucideIcon && <LucideIcon className={cn("h-6 w-6 shrink-0")} />}
                          <span className={cn("whitespace-nowrap transition-opacity duration-200 text-base", !isSidebarExpanded && "opacity-0 hidden")}>{item.label}</span>
                      </button>
                  ) : (
                      <Link key={key} href={item.href} {...commonProps}>
                          {LucideIcon && <LucideIcon className={cn("h-6 w-6 shrink-0")} />}
                          <span className={cn("whitespace-nowrap transition-opacity duration-200 text-base", !isSidebarExpanded && "opacity-0 hidden")}>{item.label}</span>
                      </Link>
                  );
                })}
              </nav>
              <div className="px-1 my-4">
                <DialogTrigger asChild>
                  <Button size="lg" className={cn("w-full rounded-full h-14 text-lg mb-6 font-bold bg-primary hover:bg-primary/90 flex items-center gap-4", isSidebarExpanded ? "justify-start px-4" : "justify-center")}>
                      <Icons.PenSquare className="h-6 w-6 shrink-0" />
                      <span className={cn("transition-opacity duration-200", !isSidebarExpanded && "opacity-0 hidden")}>نشر</span>
                  </Button>
                </DialogTrigger>
              </div>
              <UserNav isExpanded={isSidebarExpanded} />
           </div>
        </aside>

        <div className={cn("flex flex-1 transition-all duration-300 ease-in-out sm:mr-20", isSidebarExpanded && "sm:mr-64")}>
          <main className="flex-1 border-r border-l w-full max-w-[600px] mx-auto">
               <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                 <div className="sm:hidden flex-1" />
                 <h1 className="flex-1 text-xl font-bold truncate text-center">{pageTitle}</h1>
                  <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
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
              <div className="pb-16 sm:pb-0 h-[calc(100vh-65px)]">
                {children}
              </div>
          </main>
        </div>
        
        <MobileNav onPostClick={() => setCreatePostOpen(true)} />

        <DialogContent className="max-w-lg w-[95%] sm:w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء منشور جديد</DialogTitle>
          </DialogHeader>
          <CreatePost onPostCreated={() => setCreatePostOpen(false)} />
        </DialogContent>
      </div>
    </Dialog>
  );
}
