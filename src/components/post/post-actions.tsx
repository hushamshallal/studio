
"use client";

import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { doc, runTransaction, onSnapshot, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Post } from './post-types';

type PostActionsProps = {
    post: Post;
    onCommentClick: () => void;
    onShareClick: () => void;
};

export function PostActions({
    post,
    onCommentClick,
    onShareClick,
}: PostActionsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [likeCount, setLikeCount] = useState(post.likes);
    const [commentCount, setCommentCount] = useState(post.comments);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [currentUserData, setCurrentUserData] = useState<any>(null);

     useEffect(() => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setCurrentUserData(docSnap.data());
                }
            })
        }
    }, [user]);

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
      if (!user || !currentUserData) {
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
            
            // Create notification only if not liking own post
            if (post.authorId !== user.uid) {
                const notificationsRef = collection(db, 'users', post.authorId, 'notifications');
                transaction.set(doc(notificationsRef), {
                    type: 'like',
                    fromUser: {
                        name: currentUserData.displayName,
                        username: currentUserData.username,
                        avatarUrl: currentUserData.photoURL,
                    },
                    post: {
                        id: post.id,
                        content: post.content,
                    },
                    timestamp: serverTimestamp(),
                    isRead: false,
                })
            }
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
        <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex gap-1 text-muted-foreground">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={handleLikeToggle} disabled={isLikeLoading}>
                    <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}/>
                    <span>{likeCount}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={onCommentClick}>
                    <MessageCircle className="h-5 w-5"/>
                    <span>{commentCount}</span>
                </Button>
                 <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full" onClick={onShareClick}>
                    <Share2 className="h-5 w-5"/>
                </Button>
            </div>
        </CardFooter>
    );
}
