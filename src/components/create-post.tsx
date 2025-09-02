
"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Mic, Video, Send } from 'lucide-react';
import React, { useState } from "react";
import { db } from "@/lib/firebase/config";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!user || content.trim() === '') return;

        setIsPosting(true);
        try {
            // Fetch username from the user's document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const username = userDoc.exists() ? userDoc.data().username : user.email?.split('@')[0] || 'user';

            await addDoc(collection(db, 'posts'), {
                authorId: user.uid,
                authorName: user.displayName,
                authorAvatar: user.photoURL,
                authorHandle: username,
                content: content.trim(),
                mediaUrl: '',
                mediaType: '',
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            setContent('');
            toast({
                title: "تم النشر بنجاح!",
                description: "تمت إضافة منشورك إلى الخط الزمني.",
            });
            if(onPostCreated) {
                onPostCreated();
            }
        } catch (error) {
            console.error("Error creating post: ", error);
            toast({
                variant: 'destructive',
                title: "خطأ في النشر",
                description: "لم نتمكن من نشر منشورك. الرجاء المحاولة مرة أخرى.",
            });
        } finally {
            setIsPosting(false);
        }
    };
    
    if (loading) return null;

    return (
        <div className="p-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={user?.photoURL || ''} data-ai-hint="person" />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`بماذا تفكر يا ${user?.displayName?.split(' ')[0] || ''}؟`}
                        className="w-full bg-transparent outline-none placeholder:text-muted-foreground resize-none text-lg border-0 focus-visible:ring-0"
                        rows={4}
                        disabled={isPosting}
                    />
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                        <Image className="h-5 w-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                        <Video className="h-5 w-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
                        <Mic className="h-5 w-5"/>
                    </Button>
                </div>
                <Button onClick={handlePost} disabled={isPosting || content.trim() === ''} className="rounded-full px-6 bg-blue-500 hover:bg-blue-600">
                    {isPosting ? 'جارِ النشر...' : 'نشر'}
                </Button>
            </div>
        </div>
    )
}
