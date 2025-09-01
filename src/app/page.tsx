// This component is currently a client component to handle auth state.
// In the future, you could use a different approach to keep it a server component
// if you fetch data on the server and pass it down.
"use client";

import React, { useEffect } from 'react';
import { Sidebar, SidebarProvider, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', iconName: 'Home', label: 'الرئيسية' },
  { href: '#', iconName: 'Search', label: 'بحث' },
  { href: '#', iconName: 'Compass', label: 'استكشف' },
  { href: '#', iconName: 'User', label: 'الملف الشخصي' },
  { href: '#', iconName: 'Users', label: 'المجالس' },
  { href: '#', iconName: 'Mic', label: 'الديوان' },
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
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar variant="floating" collapsible="icon" className="md:border-r-0 md:bg-transparent md:p-0 md:shadow-none">
          <SidebarContent className="p-2">
            <SidebarMenu className="items-center">
              {navItems.map((item, index) => {
                const LucideIcon = (Icons as any)[item.iconName];
                return (
                    <SidebarMenuItem key={item.label} className="w-auto">
                    <SidebarMenuButton size="icon" asChild tooltip={item.label} isActive={index === 0} className="h-12 w-12 rounded-full data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
                        <Link href={item.href}>
                        {LucideIcon && <LucideIcon />}
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="md:rounded-none md:shadow-none md:m-0 max-h-screen overflow-hidden">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <Icons.Bell className="h-5 w-5" />
                        <Badge className="absolute top-1 right-1 h-4 w-4 justify-center p-1 text-xs" variant="destructive">0</Badge>
                    </Button>
                     <Button variant="ghost" size="icon">
                        <Icons.Mail className="h-5 w-5" />
                         <Badge className="absolute top-1 right-1 h-4 w-4 justify-center p-1 text-xs" variant="destructive">0</Badge>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-accent">الرئيسية</h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center space-y-4 p-4 text-center">
                <h2 className="text-2xl font-bold">مرحباً بك في سلام!</h2>
                <p className="text-muted-foreground">صفحتك الرئيسية فارغة الآن. ابحث عن أصدقاء وتابعهم لتبدأ رحلتك.</p>
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
