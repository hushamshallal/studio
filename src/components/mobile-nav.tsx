
"use client";

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface MobileNavProps {
  navItems: {
    href: string;
    iconName: keyof typeof Icons;
    label: string;
  }[];
}

export function MobileNav({ navItems }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid h-16 grid-cols-5 items-center justify-items-center">
        {navItems.slice(0, 4).map((item) => {
          const LucideIcon = Icons[item.iconName];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted',
                pathname === item.href && 'text-primary bg-muted'
              )}
            >
              {LucideIcon && <LucideIcon className="h-6 w-6" />}
            </Link>
          );
        })}
         <Button size="icon" className="rounded-full w-12 h-12 -translate-y-4 shadow-lg">
            <Icons.Plus className="h-6 w-6"/>
        </Button>
      </nav>
    </div>
  );
}
