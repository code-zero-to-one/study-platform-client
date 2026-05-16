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

export type CoursePaymentStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'WAITING_FOR_DEPOSIT'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELED';

export interface CoursePaymentPrepareRequest {
  planCode: CoursePlanCode;
}

export interface CoursePaymentPrepareResponse {
  paymentId: number;
  courseId: number;
  planId: number | null;
  planCode: CoursePlanCode;
  amount: number;
  tossOrderId: string;
  orderName: string;
}

export interface CoursePaymentConfirmResponse {
  paymentId: number;
  courseId: number;
  planId: number | null;
  planCode: CoursePlanCode;
  amount: number;
  status: CoursePaymentStatus;
  paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT';
  paidAt: string;
  tossReceiptUrl: string | null;
  virtualAccountNumber: string | null;
  virtualAccountDueDate: string | null;
  virtualAccountHolderName: string | null;
}

export interface CourseTossPaymentConfirmRequest {
  paymentId: number;
  paymentKey: string;
  orderId: string;
  amount: number;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface CourseJourneyMapLessonResponse {
  lessonId: number;
  chapterId: number;
  chapterNumber: number;
  order: number;
  title: string;
  isFree: boolean;
  estimatedMinutes: number;
  status: LessonProgressStatus;
  isAccessible: boolean;
}

export interface CourseJourneyMapChapterResponse {
  chapterId: number;
  order: number;
  chapterNumber: number;
  title: string;
  lessons: CourseJourneyMapLessonResponse[];
}

export interface CourseJourneyMapResponse {
  courseId: number;
  courseTitle: string;
  viewerStatus: ViewerStatus;
  totalLessons: number;
  completedLessons: number;
  progressRate: number;
  isCourseCompleted: boolean;
  learnerCount: number;
  latestCompletedLesson: {
    lessonId: number;
    order: number;
    title: string;
  } | null;
  nextAccessibleLesson: {
    lessonId: number;
    order: number;
    title: string;
    isFree: boolean;
    isAccessible: boolean;
  } | null;
  chapters: CourseJourneyMapChapterResponse[];
  lessons: CourseJourneyMapLessonResponse[];
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
  description: string | null;
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
  starRating?: number | null;
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
  starRating: number | null;
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
  description: string | null;
  isFree: boolean;
  isLocked: boolean;
  estimatedMinutes: number;
}

export interface CourseCurriculumChapterResponse {
  chapterId: number;
  order: number;
  chapterNumber: number;
  title: string;
  description: string | null;
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
  description: string | null;
  isDefaultExpanded: boolean;
  lessons: CourseDrawerLessonResponse[];
}

export interface CourseDrawerResponse {
  courseId: number;
  courseTitle: string;
  chapters: CourseDrawerChapterResponse[];
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export type LessonQnaAnswerStatus = 'ANSWER_WAITING' | 'ANSWERED';

export interface LessonQnaItemAuthor {
  memberId: number;
  nickname: string;
  role: string;
}

export interface LessonQnaItem {
  qnaId: number;
  lessonId: number;
  lessonTitle: string;
  title: string;
  previewText: string;
  answerStatus: LessonQnaAnswerStatus;
  curiousCount: number;
  usefulCount: number;
  author: LessonQnaItemAuthor;
  createdAt: string;
}

export interface LessonQnaListResponse {
  qnas: LessonQnaItem[];
  totalCount: number;
}

export interface LessonQnaCreateRequest {
  lessonId: number;
  content: string;
  imageKeys?: string[];
}

export interface LessonQnaUpdateRequest {
  content: string;
  imageKeys?: string[];
}

export type LessonQnaReactionType = 'USEFUL' | 'CURIOUS';
export type LessonQnaAnswerReactionType = 'HELPFUL' | 'NOT_HELPFUL';

export interface LessonQnaAnswerCreateRequest {
  content: string;
  imageKeys?: string[];
}

export interface LessonQnaAnswerUpdateRequest {
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

export interface LessonQnaUpdateResponse {
  qnaId: number;
}

export interface LessonQnaDeleteResponse {
  isDeleted: boolean;
}

export interface LessonQnaAnswerUpdateResponse {
  answerId: number;
}

export interface LessonQnaAnswerDeleteResponse {
  isDeleted: boolean;
}

export interface LessonQnaQuestionReactionToggleResponse {
  isActive: boolean;
  reactionType: LessonQnaReactionType;
  usefulCount: number;
  curiousCount: number;
}

export interface LessonQnaAnswerReactionToggleResponse {
  isActive: boolean;
  reactionType: LessonQnaAnswerReactionType;
  helpfulCount: number;
  notHelpfulCount: number;
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

export interface BuilderFeedPaywall {
  previewLimit: number | null;
  title: string;
  description: string;
  ctaLabel: string;
}

export interface BuilderFeedListResponse {
  courseId: number | null;
  courseTitle: string | null;
  feedCountLabel: string | null;
  weeklyTopBuilder: BuilderFeedWeeklyTopBuilder | null;
  feeds: BuilderFeedListItemResponse[];
  totalCount: number;
  hasNext: boolean;
  paywall: BuilderFeedPaywall | null;
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

// ─── Gift Email ───────────────────────────────────────────────────────────────

export interface GiftEmailResponse {
  isRegistered: boolean;
  email?: string;
}

export interface GiftEmailCreateRequest {
  email: string;
}
