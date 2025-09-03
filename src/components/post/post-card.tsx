
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
import { doc, runTransaction, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CommentSheet } from '@/components/comments/comment-sheet';
import { ShareSheet } from '@/components/sharing/share-sheet';
import { Post } from './post-types';
import { PostActions } from './post-actions';
import { PostHeader } from './post-header';
import { PostContentView } from './post-content';

export function PostCard({ post }: { post: Post }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [likeCount, setLikeCount] = useState(post.likes);
    const [commentCount, setCommentCount] = useState(post.comments);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    
    const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
    const [isShareSheetOpen, setShareSheetOpen] = useState(false);


    useEffect(() => {
      if (!user) return;
      
      const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
      const unsubscribe = onSnapshot(likeRef, (doc) => {
        setIsLiked(doc.exists());
      });

      return () => unsubscribe();

    }, [post.id, user]);

    useEffect(() => {
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
            transaction.delete(likeRef);
            transaction.update(postRef, { likes: currentLikeCount - 1 });
          } else {
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

    return (
      <>
        <CommentSheet 
            postId={post.id}
            isOpen={isCommentSheetOpen}
            onOpenChange={setCommentSheetOpen}
        />
        <ShareSheet 
            post={post}
            isOpen={isShareSheetOpen}
            onOpenChange={setShareSheetOpen}
        />
        <Card className="overflow-hidden rounded-xl">
            <PostHeader
                authorAvatar={post.authorAvatar}
                authorName={post.authorName}
                authorHandle={post.authorHandle}
                createdAt={post.createdAt}
            />
            <PostContentView content={post.content} mediaUrl={post.mediaUrl} mediaType={post.mediaType} />
            <PostActions
                likeCount={likeCount}
                commentCount={commentCount}
                isLiked={isLiked}
                isLikeLoading={isLikeLoading}
                onLikeToggle={handleLikeToggle}
                onCommentClick={() => setCommentSheetOpen(true)}
                onShareClick={() => setShareSheetOpen(true)}
            />
        </Card>
      </>
    )
}

