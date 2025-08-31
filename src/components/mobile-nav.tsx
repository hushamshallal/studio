"use client";

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface MobileNavProps {
  navItems: {
    href: string;
    icon: LucideIcon;
    label: string;
  }[];
}

export function MobileNav({ navItems }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid h-16 grid-cols-5 items-center justify-items-center">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 text-muted-foreground hover:text-primary',
              pathname === item.href && 'text-primary'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
