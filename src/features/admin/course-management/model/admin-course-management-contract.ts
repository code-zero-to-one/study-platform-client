export type AdminCourseStatus = 'OPEN' | 'COMING_SOON' | 'HIDDEN';
export type AdminRetrospectivePurpose =
  | 'PRACTICE_PROOF'
  | 'ARTIFACT_SHARE'
  | 'SUBJECTIVE_QUIZ';

export interface ApiBaseResponse<T> {
  statusCode: number;
  timestamp: string;
  content: T;
  message: string;
}

export interface ApiPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminCourseSummary {
  courseId: number;
  slug: string;
  title: string;
  status: AdminCourseStatus;
  lessonCount: number;
  enrolledCount: number;
  updatedAt: string | null;
}

export interface AdminCourseUpsertRequest {
  slug: string;
  title: string;
  cardHeadline: string;
  cardSummary: string;
  cardTags: string[];
  regularPrice?: number;
  discountPrice?: number;
  description: string;
  thumbnailUrl: string;
  status: AdminCourseStatus;
  durationDays?: number;
  earlyBirdEndsAt: string | null;
}

export type AdminCourseUpdateRequest = Partial<AdminCourseUpsertRequest>;

export interface AdminCourseFormValues {
  slug: string;
  title: string;
  cardHeadline: string;
  cardSummary: string;
  cardTags: string;
  regularPrice: string;
  discountPrice: string;
  description: string;
  thumbnailUrl: string;
  status: AdminCourseStatus;
  durationDays: string;
  earlyBirdEndsAt: string | null;
}

export interface AdminCourseCreateResponse {
  courseId: number;
}

export interface AdminCourseDeleteResponse {
  deleted: boolean;
  reason: string | null;
  status: AdminCourseStatus | null;
}

export interface AdminLessonSummary {
  lessonId: number;
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  retrospectivePurpose: AdminRetrospectivePurpose;
  isFree: boolean;
  isPublished: boolean;
  retrospectiveCount: number;
  updatedAt: string | null;
}

export interface AdminLessonDetailResponse {
  lessonId: number;
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  content: string;
  estimatedMinutes: number;
  retrospectivePurpose: AdminRetrospectivePurpose;
  isFree: boolean;
  isPublished: boolean;
}

export interface AdminLessonUpsertRequest {
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  content: string;
  estimatedMinutes: number;
  retrospectivePurpose: AdminRetrospectivePurpose;
  isFree: boolean;
  isPublished: boolean;
}

export type AdminLessonUpdateRequest = Partial<AdminLessonUpsertRequest>;

export interface AdminLessonCreateResponse {
  lessonId: number;
}

export interface AdminLessonDeleteResponse {
  deleted: boolean;
  reason: string | null;
  isPublished: boolean | null;
}

export interface AdminLessonOrderRequest {
  orderedLessonIds: number[];
}

export interface AdminCompletionMessageResponse {
  courseId: number;
  message: string | null;
  updatedAt: string | null;
}

export interface AdminCompletionMessageRequest {
  message: string;
}

export interface AdminCourseListParams {
  status?: AdminCourseStatus;
  page: number;
  size: number;
}

export interface AdminLessonQnaListItem {
  qnaId: number;
  title: string;
  author: {
    memberId: number;
    nickname: string;
    role: 'BUILDER' | 'MANAGER';
  };
  viewCount: number;
  answerCount: number;
  isMyQuestion: boolean;
  createdAt: string;
}

export interface AdminLessonQnaListResponse {
  myQnas: Array<{
    qnaId: number;
    title: string;
    answerCount: number;
    createdAt: string;
  }>;
  qnas: AdminLessonQnaListItem[];
  totalCount: number;
}

export interface AdminLessonQnaDetailResponse {
  qnaId: number;
  lessonId: number;
  title: string;
  content: string;
  imageUrls: string[];
  author: {
    memberId: number;
    nickname: string;
    role: 'BUILDER' | 'MANAGER';
  };
  createdAt: string;
  viewCount: number;
  answers: Array<{
    answerId: number;
    content: string;
    author: {
      memberId: number;
      nickname: string;
      role: 'BUILDER' | 'MANAGER';
    };
    createdAt: string;
  }>;
}

export interface AdminLessonQnaAnswerCreateResponse {
  answerId: number;
}

export interface AdminLessonRetrospectiveResponse {
  retrospectives: Array<{
    retrospectiveId: number;
    memberId: number;
    nickname: string;
    understandingScore: number;
    purpose: AdminRetrospectivePurpose;
    artifactType: 'SCREENSHOT' | 'LINK' | null;
    artifactValue: string | null;
    content: string;
    createdAt: string;
  }>;
}

export interface AdminLessonBuilderFeedsResponse {
  feeds: Array<{
    feedId: number;
    lessonId: number | null;
    memberId: number;
    nickname: string;
    role: 'BUILDER' | 'MANAGER';
    content: string;
    imageUrls: string[];
    likeCount: number;
    commentCount: number;
    operatorPick: boolean;
    featured: boolean;
    featuredOrder: number | null;
    createdAt: string;
  }>;
}

export interface AdminBuilderFeedCurationRequest {
  operatorPick: boolean;
  featured: boolean;
  featuredOrder: number | null;
}

export interface AdminLessonBulkUpdateRequest {
  lessonIds: number[];
  isFree?: boolean;
  isPublished?: boolean;
}
