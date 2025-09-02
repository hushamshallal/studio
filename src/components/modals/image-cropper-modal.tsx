
"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImage: string) => void;
    imageSrc: string;
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Could not get canvas context'));
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return;
            }
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg');
    });
}


export const ImageCropperModal = ({ isOpen, onClose, onSave, imageSrc }: ImageCropperModalProps) => {
    const [crop, setCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1 / 1, // Aspect ratio 1:1
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
    }
    
    const handleSave = async () => {
        if (imgRef.current && crop?.width && crop?.height) {
            // Since getCroppedImg returns a blob URL, we need to convert it to base64 to store it
            const canvas = document.createElement('canvas');
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            canvas.width = crop.width * scaleX;
            canvas.height = crop.height * scaleY;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    imgRef.current,
                    crop.x * scaleX,
                    crop.y * scaleY,
                    crop.width * scaleX,
                    crop.height * scaleY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                const base64Image = canvas.toDataURL('image/jpeg');
                onSave(base64Image);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>قص الصورة</DialogTitle>
                </DialogHeader>
                <div className="my-4 flex justify-center">
                    {imageSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="صورة للمعاينة" style={{ maxHeight: '70vh' }}/>
                        </ReactCrop>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSave}>حفظ الصورة</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

    