
export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorHandle: string;
    text: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    likes: number;
    replyCount?: number;
};

export type Reply = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorHandle: string;
    text: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    likes: number;
};
