
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const reelsData = [
  {
    id: 1,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    user: {
      name: "مبدع المحتوى",
      avatar: "https://picsum.photos/seed/user1/48/48",
      handle: "@creator1"
    },
    caption: "لقطات رائعة من رحلتي الأخيرة! 🏞️ #سفر #طبيعة",
    likes: 1250,
    comments: 230
  },
  {
    id: 2,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    user: {
      name: "فنان كوميدي",
      avatar: "https://picsum.photos/seed/user2/48/48",
      handle: "@comic"
    },
    caption: "عندما تحاول طهي وصفة من الإنترنت 😂 #كوميديا #ضحك",
    likes: 3400,
    comments: 512
  },
    {
    id: 3,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    user: {
      name: "خبير تقني",
      avatar: "https://picsum.photos/seed/user3/48/48",
      handle: "@techguru"
    },
    caption: "أحدث الاختراعات التي ستغير العالم! 🚀 #تقنية",
    likes: 5600,
    comments: 890
  },
];

const ReelItem = ({ reel, isVisible }: { reel: typeof reelsData[0], isVisible: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (isVisible) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay failed", e));
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isVisible]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };
    
    const toggleMute = () => {
        if(videoRef.current){
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    }

  return (
    <div className="h-full w-full relative snap-center flex-shrink-0" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted={isMuted}
        className="w-full h-full object-cover"
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      <AnimatePresence>
        {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Play className="h-20 w-20 text-white/70" fill="currentColor" />
            </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={reel.user.avatar} data-ai-hint="person" />
            <AvatarFallback>{reel.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{reel.user.name}</p>
            <p className="text-sm">{reel.user.handle}</p>
          </div>
          <Button variant="outline" size="sm" className="bg-white/20 border-white text-white rounded-full ml-2">متابعة</Button>
        </div>
        <p className="mt-3 text-sm">{reel.caption}</p>
      </div>

      <div className="absolute bottom-20 right-2 flex flex-col gap-4">
        <Button variant="ghost" size="icon" className="text-white h-12 w-12 flex flex-col items-center">
            <Heart className="h-7 w-7" />
            <span className="text-xs">{reel.likes.toLocaleString()}</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-white h-12 w-12 flex flex-col items-center">
            <MessageCircle className="h-7 w-7" />
            <span className="text-xs">{reel.comments.toLocaleString()}</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-white h-12 w-12">
            <Share2 className="h-7 w-7" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white h-12 w-12">
            <MoreHorizontal className="h-7 w-7" />
        </Button>
      </div>
      
       <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" className="text-white bg-black/30" onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
        </div>
    </div>
  );
};


export default function ReelsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleReel, setVisibleReel] = useState(0);

    const handleScroll = () => {
        if(containerRef.current){
            const scrollPosition = containerRef.current.scrollTop;
            const reelHeight = containerRef.current.offsetHeight;
            const currentReel = Math.round(scrollPosition / reelHeight);
            setVisibleReel(currentReel);
        }
    };
    
  return (
    <div ref={containerRef} onScroll={handleScroll} className="h-full w-full overflow-y-auto snap-y snap-mandatory bg-black rounded-lg">
        {reelsData.map((reel, index) => (
            <ReelItem key={reel.id} reel={reel} isVisible={index === visibleReel} />
        ))}
    </div>
  );
}
