// Voting (투표형 토론) 관련 타입 정의

export interface VotingOption {
  id: number;
  label: string;
  voteCount: number;
  percentage: number;
}

export interface VotingAuthor {
  id: number;
  nickname: string;
  avatar?: string;
}

export interface VotingComment {
  id: number;
  author: VotingAuthor;
  content: string;
  createdAt: string;
  isAuthor: boolean;
  votedOption?: string; // 작성자가 어떤 선택지에 투표했는지
}

export interface Voting {
  id: number;
  round: number; // 라운드 번호
  title: string; // 투표 주제
  description?: string; // 주제 설명 (선택)
  options: VotingOption[]; // 선택지 목록 (2~5개)
  totalVotes: number; // 총 투표 수
  myVote?: number; // 내가 투표한 옵션 ID (null이면 아직 투표 안함)
  commentCount: number;
  comments: VotingComment[];
  createdAt: string;
  endsAt?: string; // 투표 마감 시간 (선택)
  isActive: boolean; // 진행 중인지 종료되었는지
  tags: string[];
}

export interface VotingListResponse {
  items: Voting[];
  total: number;
  hasMore: boolean;
}
