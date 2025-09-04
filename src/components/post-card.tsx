
"use client";

import {
    Card,
  } from '@/components/ui/card';
import React, { useState } from 'react';
import { CommentSheet } from '@/components/comment-sheet';
import { ShareSheet } from '@/components/sharing/share-sheet';
import { Post } from './post/post-types';
import { PostActions } from './post/post-actions';
import { PostHeader } from './post/post-header';
import { PostContentView } from './post/post-content';

export function PostCard({ post }: { post: Post }) {
    const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
    const [isShareSheetOpen, setShareSheetOpen] = useState(false);

    return (
      <>
        <CommentSheet 
            postId={post.id}
            postAuthorId={post.authorId}
            isOpen={isCommentSheetOpen}
            onOpenChange={setCommentSheetOpen}
        />
        <ShareSheet 
            post={post}
            isOpen={isShareSheetOpen}
            onOpenChange={setShareSheetOpen}
        />
        <Card className="overflow-hidden rounded-xl">
            <PostHeader
                authorAvatar={post.authorAvatar}
                authorName={post.authorName}
                authorHandle={post.authorHandle}
                createdAt={post.createdAt}
            />
            <PostContentView content={post.content} mediaUrl={post.mediaUrl} mediaType={post.mediaType} />
            <PostActions
                post={post}
                onCommentClick={() => setCommentSheetOpen(true)}
                onShareClick={() => setShareSheetOpen(true)}
            />
        </Card>
      </>
    )
}
