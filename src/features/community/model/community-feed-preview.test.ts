import { describe, expect, it } from 'vitest';
import {
  COMMUNITY_BOARD,
  COMMUNITY_POST_ORIGIN,
  type CommunityPost,
} from '@/types/community/domain';
import {
  collectCommunityFeedQnaPreviewFallbackIds,
  mergeCommunityFeedQnaPreviewImages,
} from './community-feed-preview';

const basePost = ({
  id,
  board,
  title,
  previewImage,
  previewImageAlt,
}: {
  id: number;
  board: (typeof COMMUNITY_BOARD)[keyof typeof COMMUNITY_BOARD];
  title: string;
  previewImage?: string;
  previewImageAlt?: string;
}): CommunityPost => ({
  id,
  origin: COMMUNITY_POST_ORIGIN.API,
  board,
  title,
  summary: '',
  content: [] as const,
  contentHtml: undefined,
  previewImage,
  previewImageAlt,
  authorMemberId: 1,
  authorName: '작성자',
  authorImage: '',
  authorIntro: '',
  role: 'developer' as const,
  viewCount: 0,
  reactionCount: 0,
  commentCount: 0,
  createdAt: '방금 전',
  updatedAt: undefined,
  isTrending: false,
  canEdit: false,
  canDelete: false,
  viewerReaction: 'none',
});

const createPost = (overrides?: Partial<Parameters<typeof basePost>[0]>) =>
  basePost({
    id: 1,
    board: COMMUNITY_BOARD.FREE,
    title: 'title',
    previewImage: undefined,
    previewImageAlt: undefined,
    ...overrides,
  });

describe('community-feed-preview', () => {
  describe('collectCommunityFeedQnaPreviewFallbackIds', () => {
    it('collects only qna posts without preview images', () => {
      const ids = collectCommunityFeedQnaPreviewFallbackIds([
        createPost({
          id: 11,
          board: COMMUNITY_BOARD.QNA,
        }),
        createPost({
          id: 12,
          board: COMMUNITY_BOARD.QNA,
          previewImage: 'https://cdn.example.com/existing.png',
        }),
        createPost({
          id: 13,
          board: COMMUNITY_BOARD.FREE,
        }),
        createPost({
          id: 11,
          board: COMMUNITY_BOARD.QNA,
        }),
      ]);

      expect(ids).toEqual([11]);
    });
  });

  describe('mergeCommunityFeedQnaPreviewImages', () => {
    it('hydrates missing qna preview images without touching other posts', () => {
      const merged = mergeCommunityFeedQnaPreviewImages(
        [
          createPost({
            id: 21,
            board: COMMUNITY_BOARD.QNA,
          }),
          createPost({
            id: 22,
            board: COMMUNITY_BOARD.QNA,
            previewImage: 'https://cdn.example.com/already.png',
            previewImageAlt: '기존 alt',
          }),
          createPost({
            id: 23,
            board: COMMUNITY_BOARD.KNOWLEDGE,
          }),
        ],
        new Map([
          [
            21,
            {
              previewImage: 'https://cdn.example.com/qna.png',
              previewImageAlt: '질문답변 썸네일',
            },
          ],
          [
            23,
            {
              previewImage: 'https://cdn.example.com/general.png',
              previewImageAlt: '일반 글',
            },
          ],
        ]),
      );

      expect(merged[0].previewImage).toBe('https://cdn.example.com/qna.png');
      expect(merged[0].previewImageAlt).toBe('질문답변 썸네일');
      expect(merged[1].previewImage).toBe(
        'https://cdn.example.com/already.png',
      );
      expect(merged[1].previewImageAlt).toBe('기존 alt');
      expect(merged[2].previewImage).toBeUndefined();
    });
  });
});
