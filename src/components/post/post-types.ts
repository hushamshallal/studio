
export type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    likes: number;
    comments: number;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};
