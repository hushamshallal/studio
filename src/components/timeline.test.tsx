import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { Timeline } from './timeline';
import { PostCard } from './post-card';
import { Timestamp, onSnapshot } from 'firebase/firestore';

// Mock PostCard to inspect its props
vi.mock('./post-card', () => ({
  PostCard: vi.fn(() => null),
}));

// Mock Firebase
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        onSnapshot: vi.fn(() => vi.fn()), // Return a mock unsubscribe function
        collection: vi.fn(),
        query: vi.fn(),
        orderBy: vi.fn(),
    };
});

// Mock db config
vi.mock('@/lib/firebase/config', () => ({
    db: {
        // Not a real Firestore instance, but enough for the test
        type: 'firestore',
    },
}));

describe('Timeline', () => {
    it('should handle incoming posts from onSnapshot correctly', () => {
        const initialPosts = [];
        render(<Timeline initialPosts={initialPosts} />);

        const onSnapshotMock = onSnapshot as jest.Mock;
        const callback = onSnapshotMock.mock.calls[0][1];

        const newPost = {
            id: 'post2',
            authorId: 'user2',
            content: 'A new post',
            createdAt: new Timestamp(123456789, 0),
        };

        act(() => {
            callback({
                docs: [{
                    id: newPost.id,
                    data: () => ({
                        authorId: newPost.authorId,
                        content: newPost.content,
                        createdAt: newPost.createdAt,
                    }),
                }],
            });
        });

        // With the fix, PostCard receives a number
        expect(PostCard).toHaveBeenCalledWith(
            expect.objectContaining({
                post: expect.objectContaining({
                    createdAt: expect.any(Number)
                })
            }),
            expect.anything()
        );
    });
});
