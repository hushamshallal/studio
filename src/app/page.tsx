import type { Metadata } from 'next';
import { Home, Users, Clapperboard, AudioLines, MessageSquare, Compass, Settings, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MobileNav } from '@/components/mobile-nav';
import { UserNav } from '@/components/user-nav';
import { Stories } from '@/components/stories';
import { CreatePost } from '@/components/create-post';
import { PostCard } from '@/components/post-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'الرئيسية | سلام',
  description: 'مرحباً بك في سلام',
};

const navItems = [
  { href: '#', icon: Home, label: 'الرئيسية' },
  { href: '#', icon: Compass, label: 'استكشف' },
  { href: '#', icon: Clapperboard, label: 'ريلز' },
  { href: '#', icon: Users, label: 'المجالس' },
  { href: '#', icon: AudioLines, label: 'الديوان' },
  { href: '#', icon: MessageSquare, label: 'الرسائل' },
];

export default function AppPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-10 w-10 p-0 font-headline text-accent text-2xl group-data-[collapsible=icon]:hidden">س</Button>
              <h1 className="text-2xl font-bold font-headline text-accent group-data-[collapsible=icon]:hidden">
                سلام
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={index === 0}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="الإعدادات">
                        <Link href="#">
                            <Settings/>
                            <span>الإعدادات</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="تسجيل الخروج">
                        <Link href="/login">
                            <LogOut/>
                            <span>تسجيل الخروج</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-h-screen overflow-hidden">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-xl font-bold font-headline hidden md:block">الرئيسية</h1>
                </div>
                <UserNav />
            </header>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <main className="flex-1 space-y-6 p-4 pt-6 md:p-8">
                <Stories />
                <CreatePost />
                <div className="space-y-4">
                    <PostCard
                        username="عمر_عبدالله"
                        userhandle="@omar"
                        avatarUrl="https://picsum.photos/100/100?a"
                        time="5 دقائق"
                        content="انطباعاتي الأولى عن واجهة سلام الجديدة، تصميم أنيق وجميل مستوحى من التراث البابلي بلمسة عصرية. #سلام #تصميم_جديد"
                        mediaUrl="https://picsum.photos/600/400"
                        mediaType='image'
                        likes={120}
                        comments={25}
                    />
                    <PostCard
                        username="فاطمة الزهراء"
                        userhandle="@fatima"
                        avatarUrl="https://picsum.photos/100/100?b"
                        time="ساعة"
                        content="في الديوان الآن نتحدث عن مستقبل الشعر العربي في العصر الرقمي. انضموا إلينا! 🎙️"
                        likes={45}
                        comments={12}
                    />
                     <PostCard
                        username="أحمد بن خالد"
                        userhandle="@ahmed"
                        avatarUrl="https://picsum.photos/100/100?c"
                        time="3 ساعات"
                        content="أشارككم هذا الريل القصير من رحلتي الأخيرة إلى البتراء. 🏞️ #الأردن #سفر"
                        mediaUrl="https://picsum.photos/400/600"
                        mediaType='image'
                        likes={302}
                        comments={55}
                    />
                </div>
              </main>
            </ScrollArea>
        </SidebarInset>
        <MobileNav navItems={navItems} />
      </div>
    </SidebarProvider>
  );
}
