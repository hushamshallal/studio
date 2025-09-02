
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db, storage } from "@/lib/firebase/config";
import { collection, getDocs, query, doc, addDoc, serverTimestamp, orderBy, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ImageCropperModal } from "./modals/image-cropper-modal";
import { Button } from "./ui/button";

interface Story {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration?: number;
  createdAt: any;
}

interface StoryUser {
  id: string;
  username: string;
  avatarUrl: string;
  stories: Story[];
}

const DUMMY_USERS = [
  { id: '1', username: 'سارة', avatarUrl: 'https://picsum.photos/seed/sara/200/200' },
  { id: '2', username: 'أحمد', avatarUrl: 'https://picsum.photos/seed/ahmed/200/200' },
  { id: '3', username: 'فاطمة', avatarUrl: 'https://picsum.photos/seed/fatima/200/200' },
  { id: '4', username: 'خالد', avatarUrl: 'https://picsum.photos/seed/khaled/200/200' },
];


const StoryViewer = ({ users, initialUserIndex, onClose }: { users: StoryUser[], initialUserIndex: number, onClose: () => void }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

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
        setAnimationKey(prev => prev + 1);
    } else if (currentUserIndex < users.length - 1) {
        setCurrentUserIndex(currentUserIndex + 1);
        setCurrentStoryIndex(0);
        setAnimationKey(prev => prev + 1);
    } else {
        onClose();
    }
  };

  const handlePrevStory = () => {
      if (currentStoryIndex > 0) {
          setCurrentStoryIndex(currentStoryIndex - 1);
          setAnimationKey(prev => prev + 1);
      } else if (currentUserIndex > 0) {
          const prevUserIndex = currentUserIndex - 1;
          setCurrentUserIndex(prevUserIndex);
          setCurrentStoryIndex(users[prevUserIndex].stories.length - 1);
          setAnimationKey(prev => prev + 1);
      }
  };


  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); }}
    >
        <div className="relative w-full h-full max-w-md aspect-[9/16] bg-muted overflow-hidden">
             <div className="absolute top-2 left-2 right-2 flex items-center gap-1 z-20">
                {user.stories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                       <motion.div 
                          key={animationKey}
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

const AddStoryButton = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const storyInputRef = useRef<HTMLInputElement>(null);
    const [cropperState, setCropperState] = useState({ isOpen: false, imageSrc: '' });
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCropperState({ isOpen: true, imageSrc: event.target?.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = ''; // Reset input
    };

    const handleUploadStory = async (croppedImage: string) => {
        if (!user) return;
        setIsUploading(true);
        setCropperState({ isOpen: false, imageSrc: '' });

        try {
            // Upload to Firebase Storage
            const storyRef = ref(storage, `stories/${user.uid}/${Date.now()}.jpg`);
            const uploadResult = await uploadString(storyRef, croppedImage, 'data_url');
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // Save to Firestore
            const userStoriesRef = collection(db, 'users', user.uid, 'stories');
            await addDoc(userStoriesRef, {
                type: 'image',
                url: downloadURL,
                createdAt: serverTimestamp(),
            });
            
            toast({ title: "تم رفع القصة بنجاح!" });
        } catch (error) {
            console.error("Error uploading story:", error);
            toast({ variant: 'destructive', title: "فشل رفع القصة" });
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <>
             <ImageCropperModal
                isOpen={cropperState.isOpen}
                onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
                onSave={handleUploadStory}
                imageSrc={cropperState.imageSrc}
                aspectRatio={9/16}
                isCircular={false}
            />
            <input type="file" ref={storyInputRef} accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
                    <AvatarImage src={user?.photoURL || undefined} data-ai-hint="person" />
                    <AvatarFallback>أنت</AvatarFallback>
                </Avatar>
                <Button 
                    size="icon"
                    onClick={() => storyInputRef.current?.click()} 
                    disabled={isUploading}
                    className="absolute bottom-0 -right-1 flex h-6 w-6 rounded-full border-2 border-background bg-primary text-primary-foreground"
                >
                    {isUploading ? <Skeleton className="h-4 w-4 rounded-full" /> : <Plus className="h-4 w-4" />}
                </Button>
                </div>
                <span className="text-xs font-medium">أضف قصة</span>
            </div>
        </>
    );
};


export function Stories() {
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; startIndex: number }>({ isOpen: false, startIndex: 0 });

  useEffect(() => {
    const fetchStories = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(query(collection(db, 'users')));
            const usersWithStories: StoryUser[] = [];

            for (const userDoc of usersSnapshot.docs) {
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const storiesRef = collection(db, 'users', userDoc.id, 'stories');
                const storiesQuery = query(storiesRef, where('createdAt', '>', twentyFourHoursAgo), orderBy('createdAt', 'asc'));
                const storiesSnapshot = await getDocs(storiesQuery);
                
                if (!storiesSnapshot.empty) {
                    const userData = userDoc.data();
                    const stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
                    usersWithStories.push({
                        id: userDoc.id,
                        username: userData.displayName,
                        avatarUrl: userData.photoURL,
                        stories: stories,
                    });
                }
            }
            setStoryUsers(usersWithStories);
        } catch (error) {
            console.error("Error fetching stories:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchStories();
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
        {viewerState.isOpen && storyUsers.length > 0 && (
            <StoryViewer users={storyUsers} initialUserIndex={viewerState.startIndex} onClose={closeViewer} />
        )}
      </AnimatePresence>
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          <AddStoryButton />
          
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

    