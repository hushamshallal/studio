
"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CommentSheet } from './comment-sheet';

export type Post = {
    id: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    likes: number;
    comments: number;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

const parseContent = (content: string) => {
    const parts = content.split(/([#@]\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Link href={`/u/${part.substring(1)}`} key={index} className="text-primary hover:underline font-medium">
            {part}
          </Link>
        );
      }
      if (part.startsWith('#')) {
        return (
          <Link href={`/tags/${part.substring(1)}`} key={index} className="text-primary hover:underline font-medium">
            {part}
          </Link>
        );
      }
      return part;
    });
};

const formatTimestamp = (timestamp: Post['createdAt']) => {
    if (!timestamp) return 'الآن';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ar });
};


export function PostCard({ post }: { post: Post }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [commentCount, setCommentCount] = useState(post.comments);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);


    useEffect(() => {
      if (!user) return;
      
      const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
      const unsubscribe = onSnapshot(likeRef, (doc) => {
        setIsLiked(doc.exists());
      });

      return () => unsubscribe();

    }, [post.id, user]);

    useEffect(() => {
        // Also listen for real-time updates on the post's like and comment count
        const postRef = doc(db, 'posts', post.id);
        const unsubscribe = onSnapshot(postRef, (doc) => {
            if (doc.exists()) {
                setLikeCount(doc.data().likes || 0);
                setCommentCount(doc.data().comments || 0);
            }
        });
        return () => unsubscribe();
    }, [post.id]);


    const handleLikeToggle = async () => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "يجب تسجيل الدخول",
          description: "الرجاء تسجيل الدخول لتتمكن من الإعجاب بالمنشورات.",
        });
        return;
      }
      if (isLikeLoading) return;

      setIsLikeLoading(true);

      const postRef = doc(db, 'posts', post.id);
      const likeRef = doc(postRef, 'likes', user.uid);

      try {
        await runTransaction(db, async (transaction) => {
          const postDoc = await transaction.get(postRef);
          if (!postDoc.exists()) {
            throw "Post does not exist!";
          }

          const currentLikeCount = postDoc.data().likes || 0;
          const likeDoc = await transaction.get(likeRef);
          
          if (likeDoc.exists()) {
            // Unlike
            transaction.delete(likeRef);
            transaction.update(postRef, { likes: currentLikeCount - 1 });
          } else {
            // Like
            transaction.set(likeRef, { userId: user.uid, createdAt: new Date() });
            transaction.update(postRef, { likes: currentLikeCount + 1 });
          }
        });
      } catch (error) {
        console.error("Transaction failed: ", error);
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: "لم نتمكن من تسجيل إعجابك. الرجاء المحاولة مرة أخرى.",
        })
      } finally {
        setIsLikeLoading(false);
      }
    };
    
    const showComingSoonToast = (feature: string) => {
        toast({
            title: "قريباً...",
            description: `ميزة ${feature} قيد التطوير حالياً.`,
            duration: 3000,
        });
    };

    const isPortrait = post.mediaUrl?.includes('400/600');

    return (
      <>
        <CommentSheet 
            postId={post.id}
            isOpen={isCommentSheetOpen}
            onOpenChange={setCommentSheetOpen}
        />
        <Card className="overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Link href={`/u/${post.authorHandle}`}>
                    <Avatar>
                        <AvatarImage src={post.authorAvatar} alt={post.authorName} data-ai-hint="person" />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="grid gap-0">
                  <Link href={`/u/${post.authorHandle}`} className="hover:underline">
                    <p className="font-semibold">{post.authorName}</p>
                  </Link>
                  <p className="text-sm text-muted-foreground">@{post.authorHandle} · {formatTimestamp(post.createdAt)}</p>
                </div>
                <Button variant="ghost" size="icon" className="ms-auto rounded-full">
                    <MoreHorizontal />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p className="whitespace-pre-wrap text-base">
                    {parseContent(post.content)}
                </p>
                {post.mediaUrl && (
                    <div className={`relative w-full overflow-hidden rounded-lg border ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'}`}>
                       {post.mediaType === 'image' ? (
                         <Image src={post.mediaUrl} alt="Post media" fill className="object-cover" data-ai-hint="social media post" />
                       ) : (
                         <video src={post.mediaUrl} controls className="w-full h-full object-cover"></video>
                       )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex gap-1 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={handleLikeToggle} disabled={isLikeLoading}>
                        <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}/>
                        <span>{likeCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={() => setCommentSheetOpen(true)}>
                        <MessageCircle className="h-5 w-5"/>
                        <span>{commentCount}</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={() => showComingSoonToast('المشاركة')}>
                        <Share2 className="h-5 w-5"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>
      </>
    )
}
