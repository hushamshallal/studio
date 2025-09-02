
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface StoryUser {
  id: string;
  username: string;
  avatarUrl: string;
}

export function Stories() {
  const { user } = useAuth();
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const usersRef = collection(db, "users");
        // Query for users other than the current user, limit to 6 for stories
        const q = query(usersRef, where("uid", "!=", user.uid), limit(6));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().displayName,
          avatarUrl: doc.data().photoURL
        }));
        setStoryUsers(users);
      } catch (error) {
        console.error("Error fetching users for stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const StorySkeleton = () => (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-md" />
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
              <AvatarImage src={user?.photoURL || undefined} data-ai-hint="person" />
              <AvatarFallback>أنت</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs font-medium">أضف قصة</span>
        </div>
        
        {loading ? (
            Array.from({ length: 6 }).map((_, index) => <StorySkeleton key={index} />)
        ) : (
            storyUsers.map((storyUser) => (
              <div key={storyUser.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                    <Avatar className={`h-16 w-16 border-2 transition-all border-muted`}>
                    <AvatarImage src={storyUser.avatarUrl} alt={storyUser.username} data-ai-hint="person" />
                    <AvatarFallback>{storyUser.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                </button>
                <span className="text-xs font-medium">{storyUser.username}</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
