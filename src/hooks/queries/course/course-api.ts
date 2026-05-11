import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstanceV5 } from '@/api/client/axios';
import type {
  BuilderFeedCommentCreateRequest,
  BuilderFeedCommentsResponse,
  BuilderFeedCreateRequest,
  BuilderFeedDetailResponse,
  BuilderFeedListResponse,
  BuilderFeedPreviewResponse,
  BuilderFeedReportCreateRequest,
  BuilderFeedShowcaseResponse,
  BuilderFeedStatsResponse,
  CourseCompletionRecapResponse,
  CourseCurriculumResponse,
  CourseDetailResponse,
  CourseDrawerResponse,
  CourseFreeEnrollmentResponse,
  CourseJourneyMapResponse,
  CoursePaymentPrepareRequest,
  CoursePaymentPrepareResponse,
  CoursePaymentConfirmResponse,
  CourseProgressResponse,
  CourseTossPaymentConfirmRequest,
  CourseSummaryResponse,
  LessonDetailResponse,
  LessonQnaAnswerCreateRequest,
  LessonQnaAnswerReactionRequest,
  LessonQnaCreateRequest,
  LessonQnaDetailResponse,
  LessonQnaListResponse,
  LessonQnaReactionRequest,
  LessonQnaReportRequest,
  LessonQnaSidebarResponse,
  LessonRetrospectiveCreateRequest,
  LessonRetrospectiveResponse,
  MyCourseFreeEnrollmentResponse,
  MyBuilderFeedsResponse,
  OpenAlertSubscriptionRequest,
  OpenAlertSubscriptionResponse,
  StudyWithMeSubscriptionRequest,
  StudyWithMeSubscriptionResponse,
} from '@/types/api/course.types';

// ─── Course List ──────────────────────────────────────────────────────────────

export const useGetCourseList = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: { content: CourseSummaryResponse[] };
      }>('courses');
      return data.content.content;
    },
  });
};

// ─── Course Detail ────────────────────────────────────────────────────────────

export const useGetCourseDetail = (slug: string) => {
  return useQuery({
    queryKey: ['courseDetail', slug],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseDetailResponse;
      }>(`courses/${slug}`);
      return data.content;
    },
    enabled: !!slug,
  });
};

export const useGetCourseCurriculum = (slug: string) => {
  return useQuery({
    queryKey: ['courseCurriculum', slug],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseCurriculumResponse;
      }>(`courses/${slug}/curriculum`);
      return data.content;
    },
    enabled: !!slug,
  });
};

export const useGetCourseDrawer = (courseId: number) => {
  return useQuery({
    queryKey: ['courseDrawer', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseDrawerResponse;
      }>(`courses/${courseId}/drawer`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

// ─── Course Enrollment / Notifications / Payment ────────────────────────────

export const useCreateCourseFreeEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const { data } = await axiosInstanceV5.post<{
        content: CourseFreeEnrollmentResponse;
      }>(`courses/${courseId}/free-enrollments`);
      return data.content;
    },
    onSuccess: async (_, courseId) => {
      await queryClient.invalidateQueries({ queryKey: ['courseDetail'] });
      await queryClient.invalidateQueries({
        queryKey: ['myCourseFreeEnrollment', courseId],
      });
    },
  });
};

export const useGetMyCourseFreeEnrollment = (courseId: number) => {
  return useQuery({
    queryKey: ['myCourseFreeEnrollment', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: MyCourseFreeEnrollmentResponse;
      }>(`courses/${courseId}/free-enrollments/me`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

export const useCreateOpenAlertSubscription = () => {
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: OpenAlertSubscriptionRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: OpenAlertSubscriptionResponse;
      }>(`courses/${courseId}/alert-subscription`, request);
      return data.content;
    },
  });
};

export const useCreateStudyWithMeSubscription = () => {
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: StudyWithMeSubscriptionRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: StudyWithMeSubscriptionResponse;
      }>(`courses/${courseId}/study-with-me/subscription`, request);
      return data.content;
    },
  });
};

export const usePrepareCoursePayment = () => {
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: CoursePaymentPrepareRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: CoursePaymentPrepareResponse;
      }>(`courses/${courseId}/payments/prepare`, request);
      return data.content;
    },
  });
};

export const usePrepareCoursePaymentQuery = ({
  courseId,
  planCode,
  enabled = true,
}: {
  courseId: number;
  planCode: CoursePaymentPrepareRequest['planCode'];
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['coursePayment', courseId, planCode],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.post<{
        content: CoursePaymentPrepareResponse;
      }>(`courses/${courseId}/payments/prepare`, { planCode });
      return data.content;
    },
    enabled: enabled && !!courseId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

export const useConfirmCourseTossPayment = () => {
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: CourseTossPaymentConfirmRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: CoursePaymentConfirmResponse;
      }>(`courses/${courseId}/payments/toss/confirm`, request);
      return data.content;
    },
  });
};

// ─── Journey Map ──────────────────────────────────────────────────────────────

export const useGetCourseJourneyMap = (courseId: number) => {
  return useQuery({
    queryKey: ['courseJourneyMap', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseJourneyMapResponse;
      }>(`courses/${courseId}/journey-map`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

// ─── Progress ─────────────────────────────────────────────────────────────────

export const useGetCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseProgressResponse;
      }>(`courses/${courseId}/progress`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

// ─── Completion ───────────────────────────────────────────────────────────────

export const useGetCourseCompletionRecap = (courseId: number) => {
  return useQuery({
    queryKey: ['courseCompletionRecap', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CourseCompletionRecapResponse;
      }>(`courses/${courseId}/completion-recap`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

export const useSubmitNextPlan = () => {
  return useMutation({
    mutationFn: async ({
      courseId,
      nextPlan,
    }: {
      courseId: number;
      nextPlan: string;
    }) => {
      const { data } = await axiosInstanceV5.post<{ content: unknown }>(
        `courses/${courseId}/next-plan`,
        { nextPlan },
      );
      return data.content;
    },
  });
};

// ─── Lesson ───────────────────────────────────────────────────────────────────

export const useGetLessonDetail = (lessonId: number) => {
  return useQuery({
    queryKey: ['lessonDetail', lessonId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: LessonDetailResponse;
      }>(`lessons/${lessonId}`);
      return data.content;
    },
    enabled: !!lessonId,
  });
};

// ─── Retrospective ────────────────────────────────────────────────────────────

export const useGetLessonRetrospective = (lessonId: number) => {
  return useQuery({
    queryKey: ['lessonRetrospective', lessonId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: LessonRetrospectiveResponse;
      }>(`lessons/${lessonId}/retrospective`);
      return data.content;
    },
    enabled: !!lessonId,
  });
};

export const useSubmitLessonRetrospective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      request,
    }: {
      lessonId: number;
      request: LessonRetrospectiveCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { lessonRetrospectiveId: number };
      }>(`lessons/${lessonId}/retrospective`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonDetail', variables.lessonId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['lessonRetrospective', variables.lessonId],
      });
    },
  });
};

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export const useGetCourseQnas = ({
  courseId,
  search,
  filter,
  sort,
}: {
  courseId: number;
  search?: string;
  filter?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ['courseQnas', courseId, search, filter, sort],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: LessonQnaListResponse;
      }>(`courses/${courseId}/qnas`, {
        params: { search, filter, sort },
      });
      return data.content;
    },
    enabled: !!courseId,
  });
};

export const useCreateLessonQna = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: LessonQnaCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { qnaId: number };
      }>(`courses/${courseId}/qnas`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['courseQnas', variables.courseId],
      });
    },
  });
};

export const useGetLessonQnaDetail = (qnaId: number | null) => {
  return useQuery({
    queryKey: ['lessonQnaDetail', qnaId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: LessonQnaDetailResponse;
      }>(`qnas/${qnaId}`);
      return data.content;
    },
    enabled: !!qnaId,
  });
};

export const useCreateLessonQnaAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qnaId,
      request,
    }: {
      qnaId: number;
      request: LessonQnaAnswerCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { answerId: number };
      }>(`qnas/${qnaId}/answers`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', variables.qnaId],
      });
    },
  });
};

export const useReactLessonQna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qnaId,
      request,
    }: {
      qnaId: number;
      request: LessonQnaReactionRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: unknown;
      }>(`qnas/${qnaId}/reactions`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', variables.qnaId],
      });
    },
  });
};

export const useReactLessonQnaAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      answerId,
      qnaId,
      request,
    }: {
      answerId: number;
      qnaId: number;
      request: LessonQnaAnswerReactionRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: unknown;
      }>(`qna-answers/${answerId}/reactions`, request);
      return { content: data.content, qnaId };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', result.qnaId],
      });
    },
  });
};

export const useReportLessonQna = () => {
  return useMutation({
    mutationFn: async ({
      qnaId,
      request,
    }: {
      qnaId: number;
      request: LessonQnaReportRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: unknown;
      }>(`qnas/${qnaId}/report`, request);
      return data.content;
    },
  });
};

// ─── Builder Feed ─────────────────────────────────────────────────────────────

export const useGetBuilderFeeds = ({
  courseId,
  sort,
  filter,
  lessonId,
  memberId,
  page = 0,
  size = 6,
}: {
  courseId: number;
  sort?: 'LATEST' | 'POPULAR';
  filter?: 'ALL' | 'MY' | 'OPERATOR_PICK';
  lessonId?: number;
  memberId?: number;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: [
      'builderFeeds',
      courseId,
      sort,
      filter,
      lessonId,
      memberId,
      page,
      size,
    ],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedListResponse;
      }>(`courses/${courseId}/builder-feeds`, {
        params: { sort, filter, lessonId, memberId, page, size },
      });
      return data.content;
    },
    enabled: !!courseId,
  });
};

export const useCreateBuilderFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: number;
      request: BuilderFeedCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { feedId: number };
      }>(`courses/${courseId}/builder-feeds`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['builderFeeds', variables.courseId],
      });
    },
  });
};

export const useGetBuilderFeedDetail = (feedId: number) => {
  return useQuery({
    queryKey: ['builderFeedDetail', feedId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedDetailResponse;
      }>(`builder-feeds/${feedId}`);
      return data.content;
    },
    enabled: !!feedId,
  });
};

export const useToggleFeedLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feedId: number) => {
      const { data } = await axiosInstanceV5.post<{
        content: { isLiked: boolean; likeCount: number };
      }>(`builder-feeds/${feedId}/like`);
      return data.content;
    },
    onSuccess: async (_, feedId) => {
      await queryClient.invalidateQueries({
        queryKey: ['builderFeedDetail', feedId],
      });
    },
  });
};

export const useGetFeedComments = (feedId: number) => {
  return useQuery({
    queryKey: ['feedComments', feedId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedCommentsResponse;
      }>(`builder-feeds/${feedId}/comments`);
      return data.content;
    },
    enabled: !!feedId,
  });
};

export const useCreateFeedComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      feedId,
      request,
    }: {
      feedId: number;
      request: BuilderFeedCommentCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { commentId: number };
      }>(`builder-feeds/${feedId}/comments`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['feedComments', variables.feedId],
      });
    },
  });
};

export const useReportBuilderFeed = () => {
  return useMutation({
    mutationFn: async ({
      feedId,
      request,
    }: {
      feedId: number;
      request: BuilderFeedReportCreateRequest;
    }) => {
      const { data } = await axiosInstanceV5.post<{
        content: { reportId: number };
      }>(`builder-feeds/${feedId}/report`, request);
      return data.content;
    },
  });
};

// ─── Builder Feed (lesson preview) ────────────────────────────────────────────

export const useGetLessonBuilderFeedPreview = (lessonId: number) => {
  return useQuery({
    queryKey: ['lessonBuilderFeedPreview', lessonId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedPreviewResponse;
      }>(`lessons/${lessonId}/builder-feeds/preview`);
      return data.content;
    },
    enabled: !!lessonId,
  });
};

export const useGetBuilderFeedShowcase = (courseId: number) => {
  return useQuery({
    queryKey: ['builderFeedShowcase', courseId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedShowcaseResponse;
      }>(`courses/${courseId}/showcase`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

// ─── My Builder Feeds / Stats ─────────────────────────────────────────────────

export const useGetMyBuilderFeedStats = () => {
  return useQuery({
    queryKey: ['myBuilderFeedStats'],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: BuilderFeedStatsResponse;
      }>('members/me/builder-feed-stats');
      return data.content;
    },
  });
};

export const useGetMyBuilderFeeds = () => {
  return useQuery({
    queryKey: ['myBuilderFeeds'],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: MyBuilderFeedsResponse;
      }>('members/me/builder-feeds');
      return data.content;
    },
  });
};

// ─── Lesson Q&A Sidebar ───────────────────────────────────────────────────────

export const useGetLessonQnaSidebar = (lessonId: number) => {
  return useQuery({
    queryKey: ['lessonQnaSidebar', lessonId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: LessonQnaSidebarResponse;
      }>(`lessons/${lessonId}/qnas/sidebar`);
      return data.content;
    },
    enabled: !!lessonId,
  });
};
