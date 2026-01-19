// Discussion 관련 타입 정의

export type DiscussionTopic = 'all' | 'development' | 'study' | 'free' | 'question';
export type SortOption = 'latest' | 'popular';
export type VoteType = 'agree' | 'disagree';

export interface DiscussionAuthor {
  id: number;
  nickname: string;
  avatar?: string;
}

export interface DiscussionVote {
  agreeCount: number;
  disagreeCount: number;
  myVote?: VoteType | null;
}

export interface DiscussionComment {
  id: number;
  author: DiscussionAuthor;
  content: string;
  createdAt: string;
  isAuthor: boolean; // 현재 로그인 유저가 작성자인지
}

export interface Discussion {
  id: number;
  title: string;
  content: string;
  summary: string; // 목록용 요약 (2줄)
  author: DiscussionAuthor;
  topic: DiscussionTopic;
  tags: string[];
  vote: DiscussionVote;
  commentCount: number;
  comments: DiscussionComment[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string; // 최신 활동 시간 (댓글 등)
}

export interface DiscussionListParams {
  q?: string; // 검색 키워드
  sort?: SortOption;
  topic?: DiscussionTopic;
  page?: number;
  limit?: number;
}

export interface DiscussionListResponse {
  items: Discussion[];
  total: number;
  page: number;
  hasMore: boolean;
}
