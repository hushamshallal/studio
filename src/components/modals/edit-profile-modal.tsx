
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera } from 'lucide-react';
import { ImageCropperModal } from './image-cropper-modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

type UserProfile = {
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL: string;
    bio?: string;
    createdAt: any;
}

interface EditProfileModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (details: { fullName: string; bio: string }, newAvatarUrl?: string) => Promise<void>;
}

export const EditProfileModal = ({ user, isOpen, onClose, onSave }: EditProfileModalProps) => {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [cropperState, setCropperState] = useState({
        isOpen: false,
        imageSrc: '',
    });

    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isOpen && user) {
            setFullName(user.displayName);
            setBio(user.bio || '');
            setAvatarPreview(user.photoURL);
            setAvatarFile(null);
        }
    }, [user, isOpen]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { 
                alert("حجم الصورة يتجاوز 5 ميجابايت. الرجاء اختيار صورة أصغر.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setCropperState({
                    isOpen: true,
                    imageSrc: event.target?.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset input
    };
    
    const handleCropperSave = (croppedImage: string) => {
        setAvatarPreview(croppedImage);
        setAvatarFile(croppedImage); // This is the base64 string
        setCropperState({ isOpen: false, imageSrc: '' });
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Note: In a real app, you'd upload the base64 `avatarFile` to a storage service (like Firebase Storage)
            // and get a URL back, then save that URL. For simplicity here, we're passing the base64 string.
            // This is NOT recommended for production as it can be very large.
            await onSave({ fullName, bio }, avatarFile || undefined);
            onClose();
        } catch (error) {
            console.error("Failed to save profile:", error);
            // Optionally, show an error toast
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <ImageCropperModal
                isOpen={cropperState.isOpen}
                onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
                onSave={handleCropperSave}
                imageSrc={cropperState.imageSrc}
            />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <Avatar className="w-28 h-28 border-4 border-background">
                                    <AvatarImage src={avatarPreview || undefined} alt={fullName} />
                                    <AvatarFallback>{fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="تغيير الصورة الشخصية"
                                >
                                    <Camera className="w-6 h-6" />
                                </button>
                                <input type="file" ref={avatarInputRef} accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">الاسم الكامل</Label>
                            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">الوصف التعريفي</Label>
                            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="اكتب وصفًا تعريفيًا مختصرًا..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>إلغاء</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

    