"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Mic, Video } from 'lucide-react';
import React from "react";

export function CreatePost() {
    const { user } = useAuth();

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || ''} data-ai-hint="person" />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <textarea
                            placeholder={`بماذا تفكر يا ${user?.displayName?.split(' ')[0] || ''}؟`}
                            className="w-full bg-transparent outline-none placeholder:text-muted-foreground resize-none text-lg"
                            rows={2}
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
                    <Button className="rounded-full px-6">نشر</Button>
                </div>
            </CardContent>
        </Card>
    )
}
