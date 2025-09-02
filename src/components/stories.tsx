
"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

interface StoryUser {
  id: string;
  username: string;
  avatarUrl: string;
  stories: { type: 'image' | 'video', url: string, duration?: number }[];
}

const DUMMY_STORIES: StoryUser[] = [
  { id: '1', username: 'سارة', avatarUrl: 'https://picsum.photos/seed/sara/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/sara-story1/1080/1920' }] },
  { id: '2', username: 'أحمد', avatarUrl: 'https://picsum.photos/seed/ahmed/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/ahmed-story1/1080/1920' }, { type: 'image', url: 'https://picsum.photos/seed/ahmed-story2/1080/1920' }] },
  { id: '3', username: 'فاطمة', avatarUrl: 'https://picsum.photos/seed/fatima/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/fatima-story1/1080/1920' }] },
  { id: '4', username: 'خالد', avatarUrl: 'https://picsum.photos/seed/khaled/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/khaled-story1/1080/1920' }] },
  { id: '5', username: 'نورة', avatarUrl: 'https://picsum.photos/seed/noura/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/noura-story1/1080/1920' }] },
  { id: '6', username: 'يوسف', avatarUrl: 'https://picsum.photos/seed/youssef/200/200', stories: [{ type: 'image', url: 'https://picsum.photos/seed/youssef-story1/1080/1920' }] },
];

const StoryViewer = ({ users, initialUserIndex, onClose }: { users: StoryUser[], initialUserIndex: number, onClose: () => void }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const user = users[currentUserIndex];
  const story = user.stories[currentStoryIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
        handleNextStory();
    }, 5000); // 5 seconds per story
    return () => clearTimeout(timer);
  }, [currentStoryIndex, currentUserIndex]);

  const handleNextStory = () => {
    if (currentStoryIndex < users[currentUserIndex].stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < users.length - 1) {
        setCurrentUserIndex(currentUserIndex + 1);
        setCurrentStoryIndex(0);
    } else {
        onClose();
    }
  };

  const handlePrevStory = () => {
      if (currentStoryIndex > 0) {
          setCurrentStoryIndex(currentStoryIndex - 1);
      } else if (currentUserIndex > 0) {
          const prevUserIndex = currentUserIndex - 1;
          setCurrentUserIndex(prevUserIndex);
          setCurrentStoryIndex(users[prevUserIndex].stories.length - 1);
      }
  };


  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
        <div className="relative w-full h-full max-w-md aspect-[9/16] bg-muted overflow-hidden">
             <div className="absolute top-2 left-2 right-2 flex items-center gap-1 z-20">
                {user.stories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-white"
                          initial={{ width: '0%' }}
                          animate={{ width: index < currentStoryIndex ? '100%' : (index === currentStoryIndex ? '100%' : '0%') }}
                          transition={{ duration: index === currentStoryIndex ? 5 : 0, ease: 'linear' }}
                       />
                    </div>
                ))}
            </div>

            <div className="absolute top-5 left-4 z-20 flex items-center gap-2">
                 <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarImage src={user.avatarUrl} data-ai-hint="person" />
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-bold text-sm">{user.username}</span>
            </div>

            <img src={story.url} className="w-full h-full object-cover" data-ai-hint="story picture" />

             {/* Navigation areas */}
             <div className="absolute left-0 top-0 h-full w-1/3 z-30" onClick={handlePrevStory} />
             <div className="absolute right-0 top-0 h-full w-1/3 z-30" onClick={handleNextStory} />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-50">
            <X className="w-8 h-8" />
        </button>
    </motion.div>
  );
};


export function Stories() {
  const { user } = useAuth();
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; startIndex: number }>({ isOpen: false, startIndex: 0 });

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
        setStoryUsers(DUMMY_STORIES);
        setLoading(false);
    }, 1500)
  }, []);

  const openViewer = (index: number) => {
    setViewerState({ isOpen: true, startIndex: index });
  };
  
  const closeViewer = () => {
      setViewerState({ isOpen: false, startIndex: 0 });
  }

  const StorySkeleton = () => (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-md" />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {viewerState.isOpen && (
            <StoryViewer users={storyUsers} initialUserIndex={viewerState.startIndex} onClose={closeViewer} />
        )}
      </AnimatePresence>
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
              storyUsers.map((storyUser, index) => (
                <div key={storyUser.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <button onClick={() => openViewer(index)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                      <Avatar className={`h-16 w-16 border-2 transition-all border-pink-500`}>
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
    </>
  );
}
