
"use client";

import { Mail } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-130px)] text-center">
      <Mail className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">رسائلك</h2>
      <p className="mt-2 text-muted-foreground">
        اختر محادثة من القائمة على اليسار أو ابدأ محادثة جديدة.
      </p>
    </div>
  );
}
