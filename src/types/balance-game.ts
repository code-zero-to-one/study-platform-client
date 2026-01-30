export interface BalanceGameOption {
  id: number;
  label: string;
  voteCount: number;
  percentage: number;
}

export interface BalanceGameAuthor {
  id: number;
  nickname: string;
  profileImage: string | null;
}

export interface DailyStatistic {
  date: string;
  percentages: { [key: string]: number };
}

export interface BalanceGame {
  id: number;
  title: string;
  description: string;
  options: BalanceGameOption[];
  totalVotes: number;
  commentCount?: number;
  myVote?: number | null;
  createdAt: string;
  endsAt: string;
  isActive?: boolean;
  tags?: string[];
  author: BalanceGameAuthor;
  dailyStats?: DailyStatistic[];
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
}

export interface BalanceGameListResponse {
  content: BalanceGame[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
}

export interface BalanceGameComment {
  id: number;
  content: string;
  createdAt: string;
  votedOption: string;
  author: BalanceGameAuthor;
  isAuthor: boolean;
}

export interface BalanceGameCommentListResponse {
  content: BalanceGameComment[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
}

export interface CreateBalanceGameRequest {
  title: string;
  description: string;
  options: string[];
  endsAt?: string;
  tags: string[];
}

export interface UpdateBalanceGameRequest {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface VoteRequest {
  optionId: number;
}

// Common Response Wrapper (Actual Backend Structure)
export interface ApiResponse<T> {
  content: T; // Changed from data to content
  statusCode: number; // Changed from status to statusCode
  message: string;
  timestamp?: string; // Added timestamp
}

