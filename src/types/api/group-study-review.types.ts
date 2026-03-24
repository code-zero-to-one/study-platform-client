export type ReviewSatisfaction = 'GOOD' | 'DISAPPOINTED';

export interface SelectableReviewItem {
  code?: string;
  label: string;
}

export interface SelectableReviewItemListResponse {
  goodItems: SelectableReviewItem[];
  disappointedItems: SelectableReviewItem[];
}

export interface GroupStudyExperienceReviewRequest {
  satisfaction: ReviewSatisfaction;
  selectableReviewItemCodes: string[];
  content: string;
  rating: number;
}

export interface GroupStudyReviewStatisticsItem {
  code: string;
  label: string;
  count: number;
}

export interface GroupStudyReviewStatistics {
  averageRating: number;
  totalCount: number;
  goodItems: GroupStudyReviewStatisticsItem[];
  disappointedItems: GroupStudyReviewStatisticsItem[];
}

export interface GroupStudyExperienceReviewDetail {
  reviewId: number;
  writerId: number;
  writerName: string;
  writerProfileImageUrl: string;
  satisfaction: ReviewSatisfaction;
  selectedItems: SelectableReviewItem[];
  content: string;
  rating: number;
  createdAt: string;
}

export interface GroupStudyExperienceReviewListItem {
  reviewId: number;
  writerId: number;
  writerName: string;
  writerProfileImageUrl: string;
  satisfaction: ReviewSatisfaction;
  selectedItems: SelectableReviewItem[];
  content: string;
  rating: number;
  createdAt: string;
}

export interface GroupStudyExperienceReviewPageResponse {
  items: GroupStudyExperienceReviewListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}
