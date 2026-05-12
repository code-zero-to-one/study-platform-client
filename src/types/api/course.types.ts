// ─── Course Detail ────────────────────────────────────────────────────────────

export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface CourseInstructor {
  name: string;
  role?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface CourseDetailResponse {
  courseId: number;
  slug: string;
  viewerStatus: ViewerStatus;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  learnerCount: number | null;
  durationDays: number | null;
  completionCount: number | null;
  exploringCount: number | null;
  plans: CoursePlanResponse[] | null;
  earlyBirdEndsAt: string | null;
  canFreeEnroll: boolean | null;
  isFreeEnrolled: boolean | null;
  freeLessonCount: number | null;
  journeyMapAvailable: boolean | null;
  hasFullAccess: boolean | null;
  isPaidEnrolled: boolean | null;
  canPurchase: boolean | null;
  faqs?: CourseFaqItem[];
  instructors?: CourseInstructor[];
}

export type CoursePlanCode = 'ALL_IN_ONE' | 'LEARN_ONLY';

export interface CoursePlanItemResponse {
  code: string;
  label: string;
  valueAmount: number;
}

export interface CoursePlanResponse {
  planCode: CoursePlanCode;
  name: string;
  subtitle: string;
  items: CoursePlanItemResponse[];
  totalPrice: number;
  discountPrice: number;
  regularPrice: number;
  discountRate: number;
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
  status: 'OPEN' | 'COMING_SOON';
  tags: string[];
  learnerCount: number;
  learnerLabel: string;
  regularPrice: number | null;
  discountPrice: number | null;
  ctaType: string;
}

export interface CourseFreeEnrollmentResponse {
  freeEnrollmentId: number;
  courseId: number;
  enrolledAt: string;
  freeLessonCount: number;
}

export interface MyCourseFreeEnrollmentResponse {
  isFreeEnrolled: boolean;
  freeEnrollmentId: number | null;
  courseId: number;
  enrolledAt: string | null;
  freeLessonCount: number;
}

export interface OpenAlertSubscriptionRequest {
  email: string;
  agreed: boolean;
}

export interface OpenAlertSubscriptionResponse {
  subscriptionId: number;
}

export interface StudyWithMeSubscriptionRequest {
  phone: string;
  agreed: boolean;
}

export interface StudyWithMeSubscriptionResponse {
  subscriptionId: number;
  courseId: number;
  subscribedAt: string;
}

export interface CoursePaymentPrepareRequest {
  planCode: CoursePlanCode;
}

export interface CoursePaymentPrepareResponse {
  paymentId: number;
  courseId: number;
  planCode: CoursePlanCode;
  amount: number;
  tossOrderId: string;
  orderName: string;
}

export interface CoursePaymentConfirmResponse {
  paymentId: number;
  courseId: number;
  planCode: CoursePlanCode;
  amount: number;
  status: string;
  paidAt: string;
  tossReceiptUrl: string | null;
}

export interface CourseTossPaymentConfirmRequest {
  paymentId: number;
  paymentKey: string;
  orderId: string;
  amount: number;
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
  isAccessible: boolean;
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
  estimatedMinutes: number | null;
  videoUrl: string | null;
  learnerCount: number;
  viewCount: number;
  retrospectivePurpose: string;
  retrospectivePrompt: string;
  artifactSubmissionRequired: boolean;
  contentMarkdown: string;
  progressStatus: LessonProgressStatus;
  retrospectiveSubmitted: boolean;
}

export interface LessonRetrospectiveCreateRequest {
  highlightAnswer: string;
  unexpectedAnswer: string;
  artifactType: string | null;
  artifactValue: string | null;
  feedback: { checklistFlags: boolean[]; freeText: string } | null;
}

export interface LessonRetrospectiveCreateResponse {
  retrospectiveId: number;
  feedId: number;
  isLessonCompleted: boolean;
  nextAccessibleLessonId: number | null;
  isCourseCompleted: boolean;
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
  lessonId: number;
  title: string;
  content: string;
  imageKeys?: string[];
}

export type LessonQnaReactionType = 'USEFUL' | 'CURIOUS';
export type LessonQnaAnswerReactionType = 'HELPFUL' | 'NOT_HELPFUL';

export interface LessonQnaAnswerCreateRequest {
  content: string;
  imageKeys?: string[];
}

export interface LessonQnaReactionRequest {
  reactionType: LessonQnaReactionType;
}

export interface LessonQnaAnswerReactionRequest {
  reactionType: LessonQnaAnswerReactionType;
}

export interface LessonQnaReportRequest {
  reason: string;
}

// ─── Q&A Detail ───────────────────────────────────────────────────────────────

export interface LessonQnaDetailAuthor {
  memberId: number;
  nickname: string;
  role: string;
}

export interface LessonQnaDetailAnswer {
  answerId: number;
  content: string;
  imageUrls: string[];
  author: LessonQnaDetailAuthor;
  createdAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

export interface LessonQnaDetailResponse {
  qnaId: number;
  courseId: number;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  title: string;
  content: string;
  imageUrls: string[];
  author: LessonQnaDetailAuthor;
  createdAt: string;
  viewCount: number;
  usefulCount: number;
  curiousCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
  answers: LessonQnaDetailAnswer[];
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

export interface BuilderFeedWeeklyTopBuilder {
  memberId: number;
  nickname: string;
  role: string;
  feedId: number | null;
  likeCount: number | null;
  highlight: string | null;
}

export interface BuilderFeedListResponse {
  courseId: number | null;
  courseTitle: string | null;
  totalCountLabel: string | null;
  weeklyTopBuilder: BuilderFeedWeeklyTopBuilder | null;
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

export interface BuilderFeedCommentReplyResponse {
  commentId: number;
  content: string;
  author: FeedAuthor;
  createdAt: string;
}

export interface BuilderFeedCommentResponse {
  commentId: number;
  content: string;
  author: FeedAuthor;
  createdAt: string;
  replies: BuilderFeedCommentReplyResponse[];
}

export interface BuilderFeedCommentsResponse {
  comments: BuilderFeedCommentResponse[];
}

export interface BuilderFeedCreateRequest {
  lessonId: number;
  content: string;
  imageKeys?: string[];
}

export interface BuilderFeedCommentCreateRequest {
  content: string;
  parentCommentId?: number | null;
}

export interface BuilderFeedReportCreateRequest {
  reason: string;
  commentId?: number | null;
}

// ─── Builder Feed Preview (lesson sidebar) ────────────────────────────────────

export interface BuilderFeedPreviewItemResponse {
  feedId: number;
  content: string;
  thumbnailUrl: string | null;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export interface BuilderFeedPreviewResponse {
  feeds: BuilderFeedPreviewItemResponse[];
  totalCount: number;
}

// ─── Builder Feed Showcase (course detail) ───────────────────────────────────

export interface BuilderFeedShowcaseItemResponse {
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

export interface BuilderFeedShowcaseResponse {
  courseId: number;
  items: BuilderFeedShowcaseItemResponse[];
}

// ─── My Builder Feeds / Stats ─────────────────────────────────────────────────

export interface MyBuilderFeedItemResponse {
  feedId: number;
  courseId: number;
  lessonId: number;
  content: string;
  thumbnailUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface MyBuilderFeedsResponse {
  feeds: MyBuilderFeedItemResponse[];
  totalCount: number;
}

export interface BuilderFeedStatsResponse {
  feedCount: number;
  totalLikeCount: number;
  totalCommentCount: number;
}

// ─── Lesson Q&A Sidebar ───────────────────────────────────────────────────────

export interface LessonQnaSidebarItem {
  qnaId: number;
  title: string;
  answerCount: number;
  createdAt: string;
}

export interface LessonQnaSidebarResponse {
  qnas: LessonQnaSidebarItem[];
}
