import {
  COMMUNITY_BOARD,
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  type CommunityBoardOption,
  type CommunityFeedFilterOption,
  type CommunityFeedViewOption,
} from '@/types/community/domain';

export const COMMUNITY_FEED_FILTER_OPTIONS: readonly CommunityFeedFilterOption[] =
  [
    { id: COMMUNITY_FEED_FILTER.ALL, label: '전체' },
    { id: COMMUNITY_FEED_FILTER.QNA, label: '질문답변' },
    { id: COMMUNITY_FEED_FILTER.FREE, label: '자유' },
    { id: COMMUNITY_FEED_FILTER.ACHIEVEMENT, label: '자랑거리' },
    { id: COMMUNITY_FEED_FILTER.KNOWLEDGE, label: 'IT 지식' },
  ] as const;

export const COMMUNITY_BOARD_OPTIONS: readonly CommunityBoardOption[] = [
  { id: COMMUNITY_BOARD.QNA, label: '질문답변' },
  { id: COMMUNITY_BOARD.FREE, label: '자유' },
  { id: COMMUNITY_BOARD.ACHIEVEMENT, label: '자랑거리' },
  { id: COMMUNITY_BOARD.KNOWLEDGE, label: 'IT 지식' },
] as const;

export const COMMUNITY_FEED_VIEW_OPTIONS: readonly CommunityFeedViewOption[] = [
  { id: COMMUNITY_FEED_VIEW.LIST, label: '리스트형' },
  { id: COMMUNITY_FEED_VIEW.CARD, label: '카드형' },
] as const;

export const COMMUNITY_DISCORD_URL = 'https://discord.gg/6JGu7G4F';
export const COMMUNITY_DEFAULT_VIEWER_IMAGE = '/profile-default.svg';
