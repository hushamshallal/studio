
import { Timestamp } from "firebase/firestore";

export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorHandle: string;
    text: string;
    createdAt: number | Timestamp;
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
    createdAt: number | Timestamp;
    likes: number;
};
