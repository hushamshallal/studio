
"use client";

import { Mail } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-muted/50">
      <Mail className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-bold">رسائلك</h2>
      <p className="mt-2 text-muted-foreground">
        اختر محادثة من القائمة على اليمين أو ابدأ محادثة جديدة.
      </p>
    </div>
  );
}
