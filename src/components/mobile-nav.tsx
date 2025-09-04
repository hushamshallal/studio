
"use client";

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { Clapperboard } from 'lucide-react';

interface MobileNavProps {
  onPostClick: () => void;
}

export function MobileNav({ onPostClick }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUsername(doc.data().username);
            }
        });
        return () => unsubscribe();
    }
  }, [user]);
  
  const showComingSoonToast = () => {
    toast({
        title: "قريباً...",
        description: "هذه الميزة قيد التطوير حالياً.",
        duration: 3000,
    })
  }

  const mobileNavItems = [
    { href: '/', iconName: 'Home', label: 'الرئيسية' },
    { href: '/explore', iconName: 'Compass', label: 'استكشاف' },
    { href: '#', iconName: 'Plus', label: 'نشر', isCenter: true },
    { href: '/reels', iconName: 'Clapperboard', label: 'ريلز' },
    { href: username ? `/u/${username}` : '#', iconName: 'User', label: 'الملف الشخصي', disabled: !user || !username }
  ];


  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm sm:hidden">
      <nav className="grid h-16 grid-cols-5 items-center justify-items-center">
        {mobileNavItems.map((item, index) => {
          if (item.isCenter) {
            return (
              <div key={index} className="flex justify-center">
                <Button 
                    size="icon" 
                    className="rounded-full w-14 h-14 -translate-y-4 shadow-lg bg-primary hover:bg-primary/90"
                    onClick={onPostClick}
                    aria-label="Create Post"
                >
                  <Icons.PenSquare className="h-6 w-6"/>
                </Button>
              </div>
            );
          }

          const LucideIcon = item.iconName === 'Clapperboard' ? Clapperboard : Icons[item.iconName as keyof typeof Icons];
          const isActive = item.href !== '/' && item.href !=='#' ? pathname.startsWith(item.href) : pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.disabled ? '#' : item.href}
              onClick={(e) => {
                if(item.disabled) e.preventDefault();
              }}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-primary',
                isActive && 'text-primary',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {LucideIcon && <LucideIcon className="h-6 w-6" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
