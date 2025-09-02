
"use client";

import { Clapperboard } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";

export default function ReelsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-130px)] text-center p-4">
        <Clapperboard className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">ريلز</h2>
        <p className="mt-2 text-muted-foreground">
          هذه الميزة قيد التطوير حالياً. قريباً ستتمكن من مشاهدة وإنشاء مقاطع قصيرة هنا.
        </p>
      </div>
    </AppLayout>
  );
}
