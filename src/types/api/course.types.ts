// ─── Course Detail ────────────────────────────────────────────────────────────

export interface CourseDetailResponse {
  courseId: number;
  slug: string;
  viewerStatus: ViewerStatus;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  freeEnrollmentAvailable: boolean | null;
  freeEnrolled: boolean | null;
  freeLessonCount: number | null;
  journeyMapEnabled: boolean | null;
  fullAccess: boolean | null;
  isEnrolled: boolean | null;
  purchaseAvailable: boolean | null;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type LessonProgressStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
export type ViewerStatus =
  | 'ANONYMOUS'
  | 'LOGIN_ONLY'
  | 'FREE_ENROLLED'
  | 'PAID';

// ─── Course List ──────────────────────────────────────────────────────────────

export interface CourseSummaryResponse {
  courseId: number;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  thumbnailUrl: string | null;
  status: string;
  tags: string[];
  participantCount: number;
  participantLabel: string;
  regularPrice: number | null;
  discountPrice: number | null;
  ctaType: string;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface CourseJourneyMapResponse {
  courseId: number;
  courseTitle: string;
  viewerStatus: ViewerStatus;
  lessons: CourseJourneyMapLessonResponse[];
}

export interface CourseJourneyMapLessonResponse {
  lessonId: number;
  order: number;
  title: string;
  isFree: boolean;
  status: LessonProgressStatus;
  accessible: boolean;
}

export interface CourseProgressResponse {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressRate: number;
  isCourseCompleted: boolean;
}

export interface CourseCompletionRecapResponse {
  completedLessonCount: number;
  studyDays: number;
  siteUrlCount: number;
  completedAt: string;
  operatorMessage: string | null;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface LessonDetailResponse {
  lessonId: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  title: string;
  isFree: boolean;
  videoUrl: string | null;
  lessonViewCount: number;
  retrospectivePurpose: string;
  retrospectivePrompt: string;
  artifactSubmissionRequired: boolean;
  contentMarkdown: string;
  progressStatus: LessonProgressStatus;
  retrospectiveSubmitted: boolean;
  currentLearningMemberCount?: number;
}

export interface LessonRetrospectiveCreateRequest {
  understandingScore: number;
  content: string;
  artifactType: string | null;
  artifactValue: string | null;
  feedback: {
    checklistFlags: boolean[];
    freeText: string;
  };
}

export interface LessonRetrospectiveResponse {
  lessonId: number;
  understandingScore: number;
  content: string;
  artifactType: string | null;
  artifactValue: string | null;
  feedback: {
    checklistFlags: boolean[];
    freeText: string;
  } | null;
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface CourseCurriculumLessonResponse {
  lessonId: number;
  order: number;
  title: string;
  isFree: boolean;
  locked: boolean;
  estimatedMinutes: number;
}

export interface CourseCurriculumChapterResponse {
  chapterId: number;
  order: number;
  chapterNumber: number;
  title: string;
  estimatedMinutes: number;
  lessons: CourseCurriculumLessonResponse[];
}

export interface CourseCurriculumResponse {
  courseId: number;
  durationDays: number;
  totalChapters: number;
  totalLessons: number;
  chapters: CourseCurriculumChapterResponse[];
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export interface CourseDrawerLessonResponse {
  lessonId: number;
  order: number;
  title: string;
  isFree: boolean;
  status: LessonProgressStatus;
  isLocked: boolean;
  isCurrentLesson: boolean;
}

export interface CourseDrawerChapterResponse {
  chapterId: number;
  order: number;
  title: string;
  defaultExpanded: boolean;
  lessons: CourseDrawerLessonResponse[];
}

export interface CourseDrawerResponse {
  courseId: number;
  courseTitle: string;
  chapters: CourseDrawerChapterResponse[];
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export interface LessonQnaListResponse {
  myQnas: LessonQnaMyItem[];
  qnas: LessonQnaItem[];
  totalCount: number;
}

export interface LessonQnaMyItem {
  qnaId: number;
  title: string;
  answerCount: number;
  createdAt: string;
}

export interface LessonQnaItem {
  qnaId: number;
  title: string;
  answerCount: number;
  createdAt: string;
}

export interface LessonQnaCreateRequest {
  title: string;
  content: string;
  imageUrls?: string[];
}

// ─── Builder Feed ─────────────────────────────────────────────────────────────

export interface FeedAuthor {
  memberId: number;
  nickname: string;
  role: string;
}

export interface BuilderFeedListItemResponse {
  feedId: number;
  lessonId: number;
  content: string;
  thumbnailUrl: string | null;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface BuilderFeedListResponse {
  feeds: BuilderFeedListItemResponse[];
  totalCount: number;
  hasNext: boolean;
}

export interface BuilderFeedDetailResponse {
  feedId: number;
  courseId: number;
  lessonId: number;
  content: string;
  imageUrls: string[];
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface BuilderFeedCommentResponse {
  commentId: number;
  content: string;
  author: FeedAuthor;
  createdAt: string;
}

export interface BuilderFeedCommentsResponse {
  comments: BuilderFeedCommentResponse[];
  totalCount: number;
}

export interface BuilderFeedCreateRequest {
  lessonId: number;
  content: string;
  imageUrls?: string[];
}
