import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const storiesData = [
  { username: 'عمر', avatarUrl: 'https://picsum.photos/seed/omar/100/100', active: true },
  { username: 'خالد', avatarUrl: 'https://picsum.photos/seed/khalid/100/100', active: true },
  { username: 'مريم', avatarUrl: 'https://picsum.photos/seed/mariam/100/100', active: true },
  { username: 'نورة', avatarUrl: 'https://picsum.photos/seed/noura/100/100', active: false },
  { username: 'عبدالرحمن', avatarUrl: 'https://picsum.photos/seed/abdul/100/100', active: false },
  { username: 'فهد', avatarUrl: 'https://picsum.photos/seed/fahad/100/100', active: false },
];

export function Stories() {
  const { user } = useAuth();
  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
              <AvatarImage src={user?.photoURL || undefined} data-ai-hint="person" />
              <AvatarFallback>أنت</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs font-medium">أضف قصة</span>
        </div>

        {storiesData.map((story) => (
          <div key={story.username} className="flex flex-col items-center gap-2 flex-shrink-0">
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                <Avatar className={`h-16 w-16 border-2 transition-all ${story.active ? 'border-accent' : 'border-muted'}`}>
                <AvatarImage src={story.avatarUrl} alt={story.username} data-ai-hint="person" />
                <AvatarFallback>{story.username.charAt(0)}</AvatarFallback>
                </Avatar>
            </button>
            <span className="text-xs font-medium">{story.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
