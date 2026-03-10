/* eslint-disable @rushstack/no-new-null */

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
  startDate: string;
  endDate: string;
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
  totalCount: number | null;
  reviewerCount: number | null;
  keywords: Keyword[];
}

export interface MyNegativeKeywordsRequest {
  pageSize?: number;
}

export interface MyNegativeKeywordsResponse {
  totalCount: number | null;
  reviewerCount: number | null;
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
  reviewedAt: string;
  content: string;
  studySpaceId: number;
  startDate: string;
  endDate: string;
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

export type StudyReviewModalStateReason =
  | 'SHOW'
  | 'NO_TARGET_STUDY'
  | 'ALREADY_REVIEWED'
  | 'DISMISSED_PERMANENTLY';

export interface StudyReviewModalStateResponse {
  shouldShowModal: boolean;
  targetStudySpaceId: number | null;
  dismissedPermanently: boolean;
  reason: StudyReviewModalStateReason;
}

export interface DismissStudyReviewModalRequest {
  targetStudySpaceId: number;
}

export interface PartnerStudyReviewQueryParams {
  enabled?: boolean;
  targetStudySpaceId?: number;
}
