import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { axiosInstanceV5, axiosInstanceV6 } from '@/api/client/axios';
import { useToastStore } from '@/stores/use-toast-store';
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
  BuilderFeedUpdateRequest,
  CourseCompletionRecapResponse,
  CourseCurriculumResponse,
  CourseDetailResponse,
  CourseDrawerResponse,
  CourseFreeEnrollmentResponse,
  CourseJourneyMapResponse,
  CoursePaymentConfirmResponse,
  CoursePaymentDetailResponse,
  CoursePaymentPrepareRequest,
  CoursePaymentPrepareResponse,
  CoursePaymentStatus,
  CourseProgressResponse,
  CourseRefundCreateRequest,
  CourseSummaryResponse,
  CourseTossPaymentConfirmRequest,
  GiftEmailCreateRequest,
  GiftEmailResponse,
  LessonDetailResponse,
  LessonQnaAnswerCreateRequest,
  LessonQnaAnswerDeleteResponse,
  LessonQnaAnswerReactionRequest,
  LessonQnaAnswerReactionToggleResponse,
  LessonQnaAnswerUpdateRequest,
  LessonQnaAnswerUpdateResponse,
  LessonQnaCreateRequest,
  LessonQnaDeleteResponse,
  LessonQnaDetailResponse,
  LessonQnaListResponse,
  LessonQnaQuestionReactionToggleResponse,
  LessonQnaReactionRequest,
  LessonQnaReportRequest,
  LessonQnaSidebarResponse,
  LessonQnaUpdateRequest,
  LessonQnaUpdateResponse,
  LessonRetrospectiveCreateRequest,
  LessonRetrospectiveCreateResponse,
  LessonRetrospectiveResponse,
  MyCoursePaymentListItemResponse,
  MyBuilderFeedsResponse,
  MyBuilderFeedManagementResponse,
  MyCourseFreeEnrollmentResponse,
  OpenAlertSubscriptionRequest,
  OpenAlertSubscriptionResponse,
  StudyWithMeSubscriptionRequest,
  StudyWithMeSubscriptionResponse,
} from '@/types/api/course.types';

// ─── Course List ──────────────────────────────────────────────────────────────

export const useGetCourseList = (): UseQueryResult<CourseSummaryResponse[]> => {
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

export const useGetCourseDetail = (
  slug: string,
): UseQueryResult<CourseDetailResponse> => {
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

export const useGetCourseCurriculum = (
  slug: string,
): UseQueryResult<CourseCurriculumResponse> => {
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

export const useGetCourseDrawer = (
  courseId: number,
): UseQueryResult<CourseDrawerResponse> => {
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

export const useGetMyCourseFreeEnrollment = (
  courseId: number,
): UseQueryResult<MyCourseFreeEnrollmentResponse> => {
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
}): UseQueryResult<CoursePaymentPrepareResponse> => {
  return useQuery({
    queryKey: ['coursePayment', courseId, planCode],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.post<{
        content: CoursePaymentPrepareResponse;
      }>(`courses/${courseId}/payments/prepare`, { planCode });
      return data.content;
    },
    enabled: enabled && !!courseId,
    retry: false,
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

export const useCancelCoursePayment = (): UseMutationResult<
  void,
  unknown,
  { courseId: number; paymentId: number }
> => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { courseId: number; paymentId: number }>({
    mutationFn: async ({ courseId, paymentId }) => {
      await axiosInstanceV5.post(
        `courses/${courseId}/payments/${paymentId}/cancel`,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['myCoursePayments'] });
      useToastStore.getState().showToast('결제가 취소되었습니다.', 'success');
    },
  });
};

// ─── My Course Payments ───────────────────────────────────────────────────────

export const useGetMyCoursePayments = (
  params: { courseId?: number; status?: CoursePaymentStatus } = {},
) => {
  return useQuery({
    queryKey: ['myCoursePayments', params],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: { content: MyCoursePaymentListItemResponse[] };
      }>('mypage/course-payments', { params });
      return data.content.content;
    },
  });
};

export const useGetMyCoursePaymentDetail = (
  paymentId: number,
  options?: { enabled?: boolean },
): UseQueryResult<CoursePaymentDetailResponse> => {
  return useQuery({
    queryKey: ['myCoursePaymentDetail', paymentId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: CoursePaymentDetailResponse;
      }>(`mypage/course-payments/${paymentId}`);
      return data.content;
    },
    enabled: (options?.enabled ?? true) && !!paymentId,
  });
};

export const useRequestCourseRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      request,
    }: {
      paymentId: number;
      request: CourseRefundCreateRequest;
    }) => {
      await axiosInstanceV5.post(
        `course-payments/${paymentId}/refunds`,
        request,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['myCoursePayments'] });
    },
  });
};

// ─── Journey Map ──────────────────────────────────────────────────────────────

export const useGetCourseJourneyMap = (
  courseId: number,
): UseQueryResult<CourseJourneyMapResponse> => {
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

export const useGetCourseProgress = (
  courseId: number,
): UseQueryResult<CourseProgressResponse> => {
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

export const useGetCourseCompletionRecap = (
  courseId: number,
): UseQueryResult<CourseCompletionRecapResponse> => {
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
      content,
    }: {
      courseId: number;
      content: string;
    }) => {
      const { data } = await axiosInstanceV5.post<{ content: unknown }>(
        `courses/${courseId}/next-plan`,
        { content },
      );
      return data.content;
    },
  });
};

// ─── Lesson ───────────────────────────────────────────────────────────────────

export const useGetLessonDetail = (
  lessonId: number,
): UseQueryResult<LessonDetailResponse> => {
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
        content: LessonRetrospectiveCreateResponse;
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
      await queryClient.invalidateQueries({ queryKey: ['courseJourneyMap'] });
      await queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
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
        content: LessonQnaQuestionReactionToggleResponse;
      }>(`qnas/${qnaId}/reactions`, request);
      return { ...data.content, qnaId };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ['lessonQnaDetail', result.qnaId],
        (old: LessonQnaDetailResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            usefulCount: result.usefulCount,
            curiousCount: result.curiousCount,
          };
        },
      );
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
        content: LessonQnaAnswerReactionToggleResponse;
      }>(`qna-answers/${answerId}/reactions`, request);
      return { ...data.content, answerId, qnaId };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ['lessonQnaDetail', result.qnaId],
        (old: LessonQnaDetailResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            answers: old.answers.map((a) =>
              a.answerId === result.answerId
                ? {
                    ...a,
                    helpfulCount: result.helpfulCount,
                    notHelpfulCount: result.notHelpfulCount,
                  }
                : a,
            ),
          };
        },
      );
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

export const useUpdateLessonQna = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      qnaId,
      request,
    }: {
      qnaId: number;
      request: LessonQnaUpdateRequest;
    }) => {
      const { data } = await axiosInstanceV5.patch<{
        content: LessonQnaUpdateResponse;
      }>(`qnas/${qnaId}`, request);
      return data.content;
    },
    onSuccess: async (_, { qnaId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', qnaId],
      });
    },
  });
};

export const useDeleteLessonQna = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ qnaId }: { qnaId: number }) => {
      const { data } = await axiosInstanceV5.delete<{
        content: LessonQnaDeleteResponse;
      }>(`qnas/${qnaId}`);
      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courseQnas'] });
    },
  });
};

export const useUpdateLessonQnaAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      answerId,
      qnaId: _qnaId,
      request,
    }: {
      answerId: number;
      qnaId: number;
      request: LessonQnaAnswerUpdateRequest;
    }) => {
      const { data } = await axiosInstanceV5.patch<{
        content: LessonQnaAnswerUpdateResponse;
      }>(`qna-answers/${answerId}`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', variables.qnaId],
      });
    },
  });
};

export const useDeleteLessonQnaAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      answerId,
      qnaId: _qnaId,
    }: {
      answerId: number;
      qnaId: number;
    }) => {
      const { data } = await axiosInstanceV5.delete<{
        content: LessonQnaAnswerDeleteResponse;
      }>(`qna-answers/${answerId}`);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnaDetail', variables.qnaId],
      });
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

export const useDeleteBuilderFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feedId: number) => {
      await axiosInstanceV5.delete(`builder-feeds/${feedId}`);
    },
    onSuccess: async (_, feedId) => {
      queryClient.removeQueries({ queryKey: ['builderFeedDetail', feedId] });
      await queryClient.invalidateQueries({ queryKey: ['builderFeeds'] });
      await queryClient.invalidateQueries({ queryKey: ['myBuilderFeeds'] });
      await queryClient.invalidateQueries({ queryKey: ['myBuilderFeedStats'] });
      await queryClient.invalidateQueries({
        queryKey: ['myBuilderFeedManagement'],
      });
    },
  });
};

export const useUpdateBuilderFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      feedId,
      request,
    }: {
      feedId: number;
      request: BuilderFeedUpdateRequest;
    }) => {
      const { data } = await axiosInstanceV5.put<{
        content: { feedId: number };
      }>(`builder-feeds/${feedId}`, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['builderFeedDetail', variables.feedId],
      });
      await queryClient.invalidateQueries({ queryKey: ['builderFeeds'] });
      await queryClient.invalidateQueries({ queryKey: ['myBuilderFeeds'] });
      await queryClient.invalidateQueries({
        queryKey: ['myBuilderFeedManagement'],
      });
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

export const useGetMyBuilderFeedManagement = (params?: {
  courseId?: number | null;
  lessonId?: number | null;
  status?: string;
}): UseQueryResult<MyBuilderFeedManagementResponse> => {
  const { courseId, lessonId, status } = params ?? {};
  return useQuery({
    queryKey: [
      'myBuilderFeedManagement',
      courseId ?? null,
      lessonId ?? null,
      status ?? null,
    ],
    queryFn: async () => {
      const { data } = await axiosInstanceV6.get<{
        content: MyBuilderFeedManagementResponse;
      }>('mypage/class/my-builder-feeds', {
        params: {
          ...(courseId !== null && courseId !== undefined && { courseId }),
          ...(lessonId !== null && lessonId !== undefined && { lessonId }),
          ...(status !== null && status !== undefined && { status }),
        },
      });
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

// ─── Gift Email ───────────────────────────────────────────────────────────────

export const useGetMyGiftEmail = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['myGiftEmail'],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: GiftEmailResponse;
      }>('members/me/gift-email');
      return data.content;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useRegisterGiftEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: GiftEmailCreateRequest) => {
      const { data } = await axiosInstanceV5.post<{
        content: GiftEmailResponse;
      }>('members/me/gift-email', request);
      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['myGiftEmail'] });
    },
  });
};
