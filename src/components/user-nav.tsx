
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { auth, db } from "@/lib/firebase/config"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";

export function UserNav({ isExpanded }: { isExpanded: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user) {
        const fetchUsername = async () => {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUsername(userDoc.data().username);
            }
            setLoading(false);
        };
        fetchUsername();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            {isExpanded && 
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            }
        </div>
    )
  }

  if (!user) {
    return null;
  }
  
  const userHandle = username ? `@${username}` : (user.email ? `@${user.email.split('@')[0]}` : '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full items-center p-2 h-auto rounded-full hover:bg-sidebar-accent/50",
            isExpanded ? "justify-between" : "justify-center"
          )}
        >
            <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user.photoURL || undefined} alt="User avatar" data-ai-hint="person" />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className={cn("text-right whitespace-nowrap transition-opacity duration-200", !isExpanded && "opacity-0 hidden")}>
                <p className="font-bold text-sm text-sidebar-primary-foreground">{user.displayName}</p>
                <p className="text-muted-foreground text-xs">{userHandle}</p>
            </div>
            </div>
            <MoreHorizontal className={cn("h-5 w-5 text-sidebar-foreground/80 transition-opacity duration-200", !isExpanded && "opacity-0 hidden")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userHandle}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild disabled={!username}>
            <Link href={username ? `/u/${username}` : '#'}>الملف الشخصي</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="#">الإعدادات</Link></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
