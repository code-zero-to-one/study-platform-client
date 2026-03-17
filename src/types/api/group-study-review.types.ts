export type ReviewSatisfaction = 'GOOD' | 'DISAPPOINTED';

export interface SelectableReviewItem {
  id?: number;
  reviewSelection?: string;
  label?: string;
  satisfactionType?: string;
}

export interface SelectableReviewItemListResponse {
  goodItems?: SelectableReviewItem[];
  disappointedItems?: SelectableReviewItem[];
}

export interface GroupStudyExperienceReviewListItem {
  reviewId?: number;
  writerId?: number;
  writerName?: string;
  satisfaction?: ReviewSatisfaction;
  content?: string;
  rating?: number;
  createdAt?: string;
}

export interface GroupStudyExperienceReviewDetail {
  reviewId?: number;
  groupStudyId?: number;
  groupStudyTitle?: string;
  writerId?: number;
  writerName?: string;
  satisfaction?: ReviewSatisfaction;
  selectableReviewItems?: SelectableReviewItem[];
  content?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupStudyExperienceReviewPageResponse {
  content?: GroupStudyExperienceReviewListItem[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface GroupStudyExperienceReviewRequest {
  satisfaction: ReviewSatisfaction;
  selectableReviewItemIds: number[];
  content: string;
  rating: number;
}
