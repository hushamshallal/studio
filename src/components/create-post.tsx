"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Mic, Video } from 'lucide-react';

export function CreatePost() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person" />
                        <AvatarFallback>أنت</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="بماذا تفكر يا محمد؟"
                            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Image className="h-5 w-5"/>
                            <span className="hidden sm:inline">صورة</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Video className="h-5 w-5"/>
                            <span className="hidden sm:inline">فيديو</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Mic className="h-5 w-5"/>
                            <span className="hidden sm:inline">صوت</span>
                        </Button>
                    </div>
                    <Button>نشر</Button>
                </div>
            </CardContent>
        </Card>
    )
}
