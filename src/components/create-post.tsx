
"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video, Mic, Send, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from "react";
import { db, storage } from "@/lib/firebase/config";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const { user, loading: authLoading } from useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userData, setUserData] = useState<any>(null);

     useEffect(() => {
        if(user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(doc => {
                if(doc.exists()) {
                    setUserData(doc.data());
                }
            })
        }
    }, [user])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handlePost = async () => {
        if (!user || !userData || (content.trim() === '' && !mediaFile)) return;

        setIsPosting(true);
        let mediaUrl = '';
        let mediaType = '';

        try {
            // Upload media if it exists
            if (mediaFile) {
                const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${mediaFile.name}`);
                const snapshot = await uploadBytes(storageRef, mediaFile);
                mediaUrl = await getDownloadURL(snapshot.ref);
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            }


            await addDoc(collection(db, 'posts'), {
                authorId: user.uid,
                authorName: userData.displayName,
                authorAvatar: userData.photoURL,
                authorHandle: userData.username,
                content: content.trim(),
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });

            // Reset state
            setContent('');
            setMediaFile(null);
            setMediaPreview(null);
            if(fileInputRef.current) fileInputRef.current.value = '';

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
    
    if (authLoading || !user) {
        return (
            <div className="p-4">
                 <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-20 w-full" />
                         <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                        className="w-full bg-transparent outline-none placeholder:text-muted-foreground resize-none text-lg border-0 focus-visible:ring-0 p-0"
                        rows={4}
                        disabled={isPosting}
                    />

                    {mediaPreview && (
                        <div className="mt-4 relative">
                            <Image src={mediaPreview} width={500} height={300} alt="Preview" className="rounded-lg object-cover w-full max-h-80" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                onClick={() => {
                                    setMediaFile(null);
                                    setMediaPreview(null);
                                    if(fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                disabled={isPosting}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-1 sm:gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                    <Button variant="ghost" size="icon" className="text-primary rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isPosting}>
                        <ImageIcon className="h-5 w-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full" disabled>
                        <Video className="h-5 w-5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full" disabled>
                        <Mic className="h-5 w-5"/>
                    </Button>
                </div>
                <Button onClick={handlePost} disabled={isPosting || (content.trim() === '' && !mediaFile)} className="rounded-full px-6">
                    {isPosting ? 'جارِ النشر...' : 'نشر'}
                </Button>
            </div>
        </div>
    )
}
