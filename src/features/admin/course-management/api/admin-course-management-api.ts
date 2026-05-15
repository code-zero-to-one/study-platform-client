import { axiosInstanceV5 } from '@/api/client/axios';
import type {
  AdminBuilderFeedCurationRequest,
  AdminCompletionMessageRequest,
  AdminCompletionMessageResponse,
  AdminCourseDetailResponse,
  AdminCourseCreateResponse,
  AdminCourseDeleteResponse,
  AdminCourseListParams,
  AdminCourseSummary,
  AdminCourseUpdateRequest,
  AdminCourseUpsertRequest,
  AdminLessonBulkUpdateRequest,
  AdminLessonCreateResponse,
  AdminLessonDeleteResponse,
  AdminLessonBuilderFeedsResponse,
  AdminLessonQnaAnswerCreateResponse,
  AdminLessonQnaDetailResponse,
  AdminLessonQnaListResponse,
  AdminLessonRetrospectiveResponse,
  AdminLessonDetailResponse,
  AdminLessonOrderRequest,
  AdminLessonSummary,
  AdminLessonUpdateRequest,
  AdminLessonUpsertRequest,
  ApiBaseResponse,
  ApiPageResponse,
} from '@/features/admin/course-management/model/admin-course-management-contract';

const unwrap = <T>(response: { data: ApiBaseResponse<T> }) =>
  response.data.content;

const ADMIN_COURSE_LIST_MIN_SIZE = 1;
const ADMIN_COURSE_LIST_MAX_SIZE = 50;

const normalizeAdminCourseListParams = ({
  status,
  page,
  size,
}: AdminCourseListParams): AdminCourseListParams => ({
  status,
  page: Math.max(0, page),
  size: Math.min(
    ADMIN_COURSE_LIST_MAX_SIZE,
    Math.max(ADMIN_COURSE_LIST_MIN_SIZE, size),
  ),
});

const normalizeAdminCourseSummary = (
  course: AdminCourseSummary,
): AdminCourseSummary => ({
  ...course,
  enrolledCount: course.enrolledCount ?? course.activeEnrollmentCount ?? 0,
});

const normalizeAdminCoursePage = (
  pageResponse: ApiPageResponse<AdminCourseSummary>,
): ApiPageResponse<AdminCourseSummary> => ({
  ...pageResponse,
  content: pageResponse.content.map(normalizeAdminCourseSummary),
});

const normalizeAdminLessonRetrospective = (
  response: AdminLessonRetrospectiveResponse,
): AdminLessonRetrospectiveResponse => ({
  retrospectives: response.retrospectives.map((retrospective) => ({
    ...retrospective,
    understandingScore:
      retrospective.understandingScore ?? retrospective.starRating ?? 0,
    content:
      retrospective.content ||
      retrospective.highlightAnswer ||
      retrospective.unexpectedAnswer ||
      '',
  })),
});

const normalizeAdminLessonBuilderFeeds = (
  response: AdminLessonBuilderFeedsResponse,
): AdminLessonBuilderFeedsResponse => ({
  feeds: response.feeds.map((feed) => ({
    ...feed,
    imageUrls: feed.imageUrls ?? [],
    operatorPick: feed.operatorPick ?? feed.isOperatorPick ?? false,
    featured: feed.featured ?? feed.isFeatured ?? false,
  })),
});

const normalizeAdminLessonQnas = (
  response: AdminLessonQnaListResponse,
): AdminLessonQnaListResponse => ({
  myQnas: response.myQnas ?? [],
  qnas: (response.qnas ?? []).map((qna) => ({
    ...qna,
    answerCount: qna.answerCount ?? (qna.answerStatus === 'ANSWERED' ? 1 : 0),
    viewCount: qna.viewCount ?? 0,
    isMyQuestion: qna.isMyQuestion ?? false,
  })),
  totalCount: response.totalCount,
});

const normalizeAdminLessonQnaDetail = (
  response: AdminLessonQnaDetailResponse,
): AdminLessonQnaDetailResponse => ({
  ...response,
  imageUrls: response.imageUrls ?? [],
  answers: (response.answers ?? []).map((answer) => ({
    ...answer,
    imageUrls: answer.imageUrls ?? [],
  })),
});

export const getAdminCourses = async ({
  status,
  page,
  size,
}: AdminCourseListParams): Promise<ApiPageResponse<AdminCourseSummary>> => {
  const params = normalizeAdminCourseListParams({ status, page, size });
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<ApiPageResponse<AdminCourseSummary>>
  >('admin/courses', {
    params,
  });

  return normalizeAdminCoursePage(unwrap(response));
};

export const createAdminCourse = async (
  request: AdminCourseUpsertRequest,
): Promise<AdminCourseCreateResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminCourseCreateResponse>
  >('admin/courses', request);

  return unwrap(response);
};

export const getAdminCourseDetail = async (
  courseId: number,
): Promise<AdminCourseDetailResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminCourseDetailResponse>
  >(`admin/courses/${courseId}`);

  return unwrap(response);
};

export const updateAdminCourse = async ({
  courseId,
  request,
}: {
  courseId: number;
  request: AdminCourseUpdateRequest;
}): Promise<void> => {
  await axiosInstanceV5.put<ApiBaseResponse<void>>(
    `admin/courses/${courseId}`,
    request,
  );
};

export const deleteAdminCourse = async (
  courseId: number,
): Promise<AdminCourseDeleteResponse> => {
  const response = await axiosInstanceV5.delete<
    ApiBaseResponse<AdminCourseDeleteResponse>
  >(`admin/courses/${courseId}`);

  return unwrap(response);
};

export const getAdminCourseLessons = async (
  courseId: number,
): Promise<AdminLessonSummary[]> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonSummary[]>
  >(`admin/courses/${courseId}/lessons`);

  return unwrap(response);
};

export const getAdminLessonDetail = async (
  lessonId: number,
): Promise<AdminLessonDetailResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonDetailResponse>
  >(`admin/lessons/${lessonId}`);

  return unwrap(response);
};

export const createAdminLesson = async ({
  courseId,
  request,
}: {
  courseId: number;
  request: AdminLessonUpsertRequest;
}): Promise<AdminLessonCreateResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminLessonCreateResponse>
  >(`admin/courses/${courseId}/lessons`, request);

  return unwrap(response);
};

export const updateAdminLesson = async ({
  lessonId,
  request,
}: {
  lessonId: number;
  request: AdminLessonUpdateRequest;
}): Promise<void> => {
  await axiosInstanceV5.put<ApiBaseResponse<void>>(
    `admin/lessons/${lessonId}`,
    request,
  );
};

export const deleteAdminLesson = async (
  lessonId: number,
): Promise<AdminLessonDeleteResponse> => {
  const response = await axiosInstanceV5.delete<
    ApiBaseResponse<AdminLessonDeleteResponse>
  >(`admin/lessons/${lessonId}`);

  return unwrap(response);
};

export const bulkUpdateAdminLessons = async ({
  courseId,
  request,
}: {
  courseId: number;
  request: AdminLessonBulkUpdateRequest;
}): Promise<void> => {
  await axiosInstanceV5.patch<ApiBaseResponse<void>>(
    `admin/courses/${courseId}/lessons/bulk`,
    request,
  );
};

export const reorderAdminLessons = async ({
  courseId,
  request,
}: {
  courseId: number;
  request: AdminLessonOrderRequest;
}): Promise<void> => {
  await axiosInstanceV5.patch<ApiBaseResponse<void>>(
    `admin/courses/${courseId}/lessons/order`,
    request,
  );
};

export const getAdminCompletionMessage = async (
  courseId: number,
): Promise<AdminCompletionMessageResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminCompletionMessageResponse>
  >(`admin/courses/${courseId}/completion-message`);

  return unwrap(response);
};

export const upsertAdminCompletionMessage = async ({
  courseId,
  request,
}: {
  courseId: number;
  request: AdminCompletionMessageRequest;
}): Promise<AdminCompletionMessageResponse> => {
  const response = await axiosInstanceV5.put<
    ApiBaseResponse<AdminCompletionMessageResponse>
  >(`admin/courses/${courseId}/completion-message`, request);

  return unwrap(response);
};

export const getAdminLessonQnas = async (
  lessonId: number,
): Promise<AdminLessonQnaListResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonQnaListResponse>
  >(`admin/lessons/${lessonId}/qnas`);

  return normalizeAdminLessonQnas(unwrap(response));
};

export const getAdminLessonQnaDetail = async (
  qnaId: number,
): Promise<AdminLessonQnaDetailResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonQnaDetailResponse>
  >(`admin/qnas/${qnaId}`);

  return normalizeAdminLessonQnaDetail(unwrap(response));
};

export const createAdminLessonQnaAnswer = async ({
  qnaId,
  content,
}: {
  qnaId: number;
  content: string;
}): Promise<AdminLessonQnaAnswerCreateResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminLessonQnaAnswerCreateResponse>
  >(`admin/qnas/${qnaId}/answers`, { content });

  return unwrap(response);
};

export const getAdminLessonRetrospectives = async (
  lessonId: number,
): Promise<AdminLessonRetrospectiveResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonRetrospectiveResponse>
  >(`admin/lessons/${lessonId}/retrospectives`);

  return normalizeAdminLessonRetrospective(unwrap(response));
};

export const getAdminLessonBuilderFeeds = async (
  lessonId: number,
): Promise<AdminLessonBuilderFeedsResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonBuilderFeedsResponse>
  >(`admin/lessons/${lessonId}/builder-feeds`);

  return normalizeAdminLessonBuilderFeeds(unwrap(response));
};

export const updateAdminBuilderFeedCuration = async ({
  feedId,
  request,
}: {
  feedId: number;
  request: AdminBuilderFeedCurationRequest;
}): Promise<void> => {
  await axiosInstanceV5.patch<ApiBaseResponse<void>>(
    `admin/builder-feeds/${feedId}/curation`,
    request,
  );
};
