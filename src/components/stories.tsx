import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

const storiesData = [
  { username: 'عمر_عبدالله', avatarUrl: 'https://picsum.photos/100/100?a', active: true },
  { username: 'فاطمة', avatarUrl: 'https://picsum.photos/100/100?b', active: true },
  { username: 'أحمد', avatarUrl: 'https://picsum.photos/100/100?c', active: true },
  { username: 'سارة', avatarUrl: 'https://picsum.photos/100/100?d', active: false },
  { username: 'خالد', avatarUrl: 'https://picsum.photos/100/100?e', active: false },
  { username: 'نورة', avatarUrl: 'https://picsum.photos/100/100?f', active: false },
  { username: 'يوسف', avatarUrl: 'https://picsum.photos/100/100?g', active: false },
  { username: 'مريم', avatarUrl: 'https://picsum.photos/100/100?h', active: false },
];

export function Stories() {
  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
              <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person" />
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
            <Avatar className={`h-16 w-16 border-2 ${story.active ? 'border-accent' : 'border-border'}`}>
              <AvatarImage src={story.avatarUrl} alt={story.username} data-ai-hint="person" />
              <AvatarFallback>{story.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{story.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
