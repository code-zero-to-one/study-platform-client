// 리뷰 관련 타입
export interface EvalKeyword {
  id: number;
  keyword: string;
  satisfactionId: number;
  satisfactionLabel: string;
}

interface Partner {
  memberId: number;
  memberName: string;
  profileImageUrl: string;
}

export interface StudyEvaluationResponse {
  studySpaceId: number;
  targetMembers: Partner[];
  studySubject: string;
  startDate: string; // "yyyy-MM-dd" 형식
  endDate: string; // "yyyy-MM-dd" 형식
  satisfiedEvalKeywords: EvalKeyword[];
  notBadEvalKeywords: EvalKeyword[];
  unsatisfiedEvalKeywords: EvalKeyword[];
}

export interface AddStudyReviewRequest {
  studySpaceId: number;
  targetMemberId: number;
  satisfactionId: 10 | 20 | 30;
  keywordIds: number[];
  content?: string;
}

interface Keyword {
  id: number;
  content: string;
  count: number;
}

export interface UserPositiveKeywordsRequest {
  memberId?: number;
  pageSize?: number;
}

export interface UserPositiveKeywordsResponse {
  totalCount: number | null; // params에 pageSize 값을 보내지 않는 경우 null
  reviewerCount: number | null; // params에 pageSize 값을 보내지 않는 경우 null
  keywords: Keyword[];
}

export interface MyNegativeKeywordsRequest {
  pageSize?: number;
}

export interface MyNegativeKeywordsResponse {
  totalCount: number | null; // params에 pageSize 값을 보내지 않는 경우 null
  reviewerCount: number | null; // params에 pageSize 값을 보내지 않는 경우 null
  keywords: Keyword[];
}

export interface MyReviewWriter {
  memberId: number;
  memberName: string;
  profileImageUrl: string;
}

export interface MyReviewItem {
  id: number;
  writer: MyReviewWriter;
  reviewedAt: string; // ISO 날짜 문자열
  content: string;
  studySpaceId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  studySubjects: string[];
}

export interface MyReviewsRequest {
  cursor: number | null;
}

export interface MyReviewsResponse {
  totalCount: number;
  reviews: {
    items: MyReviewItem[];
    nextCursor: number;
    hasNext: boolean;
  };
}

export type ShouldReviewPartnerResponse = boolean;
