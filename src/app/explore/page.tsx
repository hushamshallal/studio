
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ExplorePage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="ابحث عن أشخاص، مجالس، منشورات، أو وسوم..."
                    className="w-full rounded-full bg-muted pl-4 pr-10 py-6 text-base"
                />
            </div>
            <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">ابحث للعثور على المحتوى الرائج.</p>
            </div>
        </div>
    )
}
