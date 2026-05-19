import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminCourse,
  batchUpdateAdminLessons,
  bulkUpdateAdminLessons,
  createAdminLesson,
  createAdminLessonsFromNotionZips,
  deleteAdminCourse,
  deleteAdminLesson,
  getAdminCourseDetail,
  getAdminCompletionMessage,
  getAdminCourseLessons,
  getAdminCourses,
  getAdminLessonDetail,
  getAdminLessonQnaDetail,
  getAdminLessonQnas,
  getAdminLessonRetrospectives,
  importAdminLessonContentZip,
  updateAdminBuilderFeedCuration,
  createAdminLessonQnaAnswer,
  getAdminLessonBuilderFeeds,
  reorderAdminLessons,
  updateAdminCourse,
  updateAdminLesson,
  upsertAdminCompletionMessage,
} from '@/features/admin/course-management/api/admin-course-management-api';
import { getAdminLessonInputPolicyValidationError } from '@/features/admin/course-management/model/admin-class-input-policy';
import type {
  AdminBuilderFeedCurationRequest,
  AdminCourseFormValues,
  AdminCourseListParams,
  AdminCourseUpdateRequest,
  AdminCourseUpsertRequest,
  AdminLessonBatchUpdateRequest,
  AdminLessonUpsertRequest,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import { parseAdminCourseCardTags } from '@/features/admin/course-management/model/admin-course-tag-utils';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError } from '@/utils/error-handler';

export const adminCourseManagementQueryKeys = {
  all: ['admin-course-management'] as const,
  courses: (params: AdminCourseListParams) =>
    [...adminCourseManagementQueryKeys.all, 'courses', params] as const,
  courseDetail: (courseId?: number) =>
    [...adminCourseManagementQueryKeys.all, 'course-detail', courseId] as const,
  lessons: (courseId?: number) =>
    [...adminCourseManagementQueryKeys.all, 'lessons', courseId] as const,
  lessonDetail: (lessonId?: number) =>
    [...adminCourseManagementQueryKeys.all, 'lesson-detail', lessonId] as const,
  completionMessage: (courseId?: number) =>
    [
      ...adminCourseManagementQueryKeys.all,
      'completion-message',
      courseId,
    ] as const,
  lessonQnas: (lessonId?: number) =>
    [...adminCourseManagementQueryKeys.all, 'lesson-qnas', lessonId] as const,
  lessonQnaDetail: (qnaId?: number) =>
    [
      ...adminCourseManagementQueryKeys.all,
      'lesson-qna-detail',
      qnaId,
    ] as const,
  lessonRetrospectives: (lessonId?: number) =>
    [
      ...adminCourseManagementQueryKeys.all,
      'lesson-retrospectives',
      lessonId,
    ] as const,
  lessonBuilderFeeds: (lessonId?: number) =>
    [
      ...adminCourseManagementQueryKeys.all,
      'lesson-builder-feeds',
      lessonId,
    ] as const,
};

const showMutationError = (error: unknown) => {
  const { userMessage } = analyzeError(error);
  useToastStore
    .getState()
    .showToast(userMessage || '요청 처리 중 오류가 발생했습니다.', 'error');
};

const getNotionZipImportErrorMessage = (
  error: unknown,
  operation: 'single' | 'batch',
) => {
  const errorInfo = analyzeError(error);

  if (errorInfo.statusCode === 404) {
    return '대상을 찾지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.';
  }

  if (errorInfo.statusCode === 409) {
    return operation === 'batch'
      ? '같은 챕터에 같은 레슨 번호가 이미 있어 생성할 수 없습니다. 기존 레슨 번호를 확인해주세요.'
      : '본문 교체 중 충돌이 발생했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.';
  }

  if (errorInfo.statusCode === 400) {
    return '올린 ZIP 형식을 해석하지 못했습니다. Notion export ZIP인지, markdown 1개와 이미지 파일이 함께 들어있는지 확인해주세요.';
  }

  return errorInfo.userMessage || 'ZIP import 처리 중 오류가 발생했습니다.';
};

const showNotionZipImportError = (
  error: unknown,
  operation: 'single' | 'batch',
) => {
  useToastStore
    .getState()
    .showToast(getNotionZipImportErrorMessage(error, operation), 'error');
};

export const useAdminCoursesQuery = (params: AdminCourseListParams) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.courses(params),
    queryFn: () => getAdminCourses(params),
    staleTime: 60_000,
  });

export const useAdminCourseLessonsQuery = (courseId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessons(courseId),
    queryFn: () => getAdminCourseLessons(courseId ?? 0),
    enabled: typeof courseId === 'number',
    staleTime: 30_000,
  });

export const useAdminCourseDetailQuery = (courseId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.courseDetail(courseId),
    queryFn: () => getAdminCourseDetail(courseId ?? 0),
    enabled: typeof courseId === 'number',
    staleTime: 30_000,
  });

export const useAdminLessonDetailQuery = (lessonId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessonDetail(lessonId),
    queryFn: () => getAdminLessonDetail(lessonId ?? 0),
    enabled: typeof lessonId === 'number',
    staleTime: 30_000,
  });

export const useAdminLessonQnasQuery = (lessonId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessonQnas(lessonId),
    queryFn: () => getAdminLessonQnas(lessonId ?? 0),
    enabled: typeof lessonId === 'number',
    staleTime: 30_000,
  });

export const useAdminLessonRetrospectivesQuery = (lessonId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessonRetrospectives(lessonId),
    queryFn: () => getAdminLessonRetrospectives(lessonId ?? 0),
    enabled: typeof lessonId === 'number',
    staleTime: 30_000,
  });

export const useAdminLessonBuilderFeedsQuery = (lessonId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessonBuilderFeeds(lessonId),
    queryFn: () => getAdminLessonBuilderFeeds(lessonId ?? 0),
    enabled: typeof lessonId === 'number',
    staleTime: 30_000,
  });

export const useAdminLessonQnaDetailQuery = (qnaId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.lessonQnaDetail(qnaId),
    queryFn: () => getAdminLessonQnaDetail(qnaId ?? 0),
    enabled: typeof qnaId === 'number',
    staleTime: 30_000,
  });

export const useAdminCompletionMessageQuery = (courseId?: number) =>
  useQuery({
    queryKey: adminCourseManagementQueryKeys.completionMessage(courseId),
    queryFn: () => getAdminCompletionMessage(courseId ?? 0),
    enabled: typeof courseId === 'number',
    staleTime: 30_000,
  });

export const useCreateAdminCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCourse,
    onSuccess: async () => {
      useToastStore.getState().showToast('코스를 생성했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useUpdateAdminCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminCourse,
    onSuccess: async () => {
      useToastStore.getState().showToast('코스를 저장했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useDeleteAdminCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCourse,
    onSuccess: async (response) => {
      useToastStore
        .getState()
        .showToast(
          response.deleted
            ? '코스를 삭제했습니다.'
            : '수강 이력이 있어 코스를 삭제하지 않고 비공개 처리했습니다.',
          'success',
        );
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useCreateAdminLessonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminLesson,
    onSuccess: async (_, variables) => {
      useToastStore.getState().showToast('레슨을 생성했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useImportAdminLessonContentZipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importAdminLessonContentZip,
    onSuccess: async (lessonDetail) => {
      useToastStore
        .getState()
        .showToast('본문을 ZIP 기준으로 교체했습니다.', 'success');
      queryClient.setQueryData(
        adminCourseManagementQueryKeys.lessonDetail(lessonDetail.lessonId),
        lessonDetail,
      );
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessonDetail(
          lessonDetail.lessonId,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: (error) => showNotionZipImportError(error, 'single'),
  });
};

export const useCreateAdminLessonsFromNotionZipsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminLessonsFromNotionZips,
    onSuccess: async (response, variables) => {
      useToastStore
        .getState()
        .showToast(`${response.lessonCount}개 레슨을 생성했습니다.`, 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: (error) => showNotionZipImportError(error, 'batch'),
  });
};

export const useBatchUpdateAdminLessonsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      request,
    }: {
      courseId: number;
      request: AdminLessonBatchUpdateRequest;
    }) => batchUpdateAdminLessons({ courseId, request }),
    onSuccess: async (response, variables) => {
      useToastStore
        .getState()
        .showToast(
          `${response.updatedCount}개 레슨을 저장했습니다.`,
          'success',
        );
      await Promise.all(
        response.lessons.map((lesson) =>
          queryClient.invalidateQueries({
            queryKey: adminCourseManagementQueryKeys.lessonDetail(
              lesson.lessonId,
            ),
          }),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useUpdateAdminLessonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      request,
    }: {
      courseId?: number;
      lessonId: number;
      request: AdminLessonUpsertRequest;
    }) => updateAdminLesson({ lessonId, request }),
    onSuccess: async (_, variables) => {
      useToastStore.getState().showToast('레슨을 저장했습니다.', 'success');
      if (variables.courseId) {
        await queryClient.invalidateQueries({
          queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessonDetail(
          variables.lessonId,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useDeleteAdminLessonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId }: { courseId: number; lessonId: number }) =>
      deleteAdminLesson(lessonId),
    onSuccess: async (response, variables) => {
      useToastStore
        .getState()
        .showToast(
          response.deleted
            ? '레슨을 삭제했습니다.'
            : '수강 이력이 있어 레슨을 삭제하지 않고 비게시 처리했습니다.',
          'success',
        );
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessonDetail(
          variables.lessonId,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};

export const useReorderAdminLessonsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderAdminLessons,
    onSuccess: async (_, variables) => {
      useToastStore
        .getState()
        .showToast('레슨 순서를 저장했습니다.', 'success');
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey.includes('lesson-detail'),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
    },
    onError: showMutationError,
  });
};

export const useUpsertAdminCompletionMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertAdminCompletionMessage,
    onSuccess: async (_, variables) => {
      useToastStore
        .getState()
        .showToast('완주 메시지를 저장했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.completionMessage(
          variables.courseId,
        ),
      });
    },
    onError: showMutationError,
  });
};

export const toAdminCoursePayload = (
  form: AdminCourseFormValues,
): AdminCourseUpsertRequest => {
  const toOptionalNumber = (value: string) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return undefined;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  };

  const cardTags = parseAdminCourseCardTags(form.cardTags);

  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    cardHeadline: form.cardHeadline.trim(),
    cardSummary: form.cardSummary.trim(),
    cardTags,
    description: form.description.trim(),
    thumbnailUrl: form.thumbnailUrl.trim(),
    status: form.status,
    durationDays: toOptionalNumber(form.durationDays),
  };
};

export const toAdminCourseUpdateRequest = ({
  basePayload,
  touchedFields,
}: {
  basePayload: AdminCourseUpsertRequest;
  touchedFields: Partial<Record<keyof AdminCourseFormValues, boolean>>;
}): AdminCourseUpdateRequest => {
  const request: AdminCourseUpdateRequest = {};

  if (touchedFields.slug) {
    request.slug = basePayload.slug || undefined;
  }
  if (touchedFields.title) {
    request.title = basePayload.title || undefined;
  }
  if (touchedFields.cardHeadline) {
    request.cardHeadline = basePayload.cardHeadline || undefined;
  }
  if (touchedFields.cardSummary) {
    request.cardSummary = basePayload.cardSummary || undefined;
  }
  if (touchedFields.cardTags) {
    request.cardTags = basePayload.cardTags;
  }
  if (touchedFields.description) {
    request.description = basePayload.description;
  }
  if (touchedFields.thumbnailUrl) {
    request.thumbnailUrl = basePayload.thumbnailUrl;
  }
  if (touchedFields.status) {
    request.status = basePayload.status;
  }
  if (touchedFields.durationDays) {
    request.durationDays = basePayload.durationDays;
  }

  return request;
};

export const toAdminLessonPayload = (
  form: AdminLessonUpsertRequest,
): AdminLessonUpsertRequest => ({
  ...form,
  chapterNumber: Number(form.chapterNumber),
  lessonNumber: Number(form.lessonNumber),
  estimatedMinutes: Number(form.estimatedMinutes),
});

export const getAdminLessonPayloadValidationError = (
  payload: AdminLessonUpsertRequest,
) => {
  return getAdminLessonInputPolicyValidationError(payload) ?? null;
};

export const useCreateAdminLessonQnaAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminLessonQnaAnswer,
    onSuccess: async (_, variables) => {
      useToastStore.getState().showToast('QnA 답변을 등록했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessonQnaDetail(
          variables.qnaId,
        ),
      });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey.includes('lesson-qnas'),
      });
    },
    onError: showMutationError,
  });
};

export const useUpdateAdminBuilderFeedCurationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedId,
      lessonId,
      request,
    }: {
      feedId: number;
      lessonId: number;
      request: AdminBuilderFeedCurationRequest;
    }) => updateAdminBuilderFeedCuration({ feedId, request }),
    onSuccess: async (_, variables) => {
      useToastStore
        .getState()
        .showToast('Builder Feed 운영 상태를 저장했습니다.', 'success');
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessonBuilderFeeds(
          variables.lessonId,
        ),
      });
    },
    onError: showMutationError,
  });
};

export const useBulkUpdateAdminLessonsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateAdminLessons,
    onSuccess: async (_, variables) => {
      useToastStore
        .getState()
        .showToast('선택한 레슨 상태를 일괄 저장했습니다.', 'success');
      await Promise.all(
        variables.request.lessonIds.map((lessonId) =>
          queryClient.invalidateQueries({
            queryKey: adminCourseManagementQueryKeys.lessonDetail(lessonId),
          }),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.lessons(variables.courseId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminCourseManagementQueryKeys.all,
      });
    },
    onError: showMutationError,
  });
};
