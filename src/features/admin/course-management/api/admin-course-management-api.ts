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

export const getAdminCourses = async ({
  status,
  page,
  size,
}: AdminCourseListParams): Promise<ApiPageResponse<AdminCourseSummary>> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<ApiPageResponse<AdminCourseSummary>>
  >('admin/courses', {
    params: { status, page, size },
  });

  return unwrap(response);
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

  return unwrap(response);
};

export const getAdminLessonQnaDetail = async (
  qnaId: number,
): Promise<AdminLessonQnaDetailResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonQnaDetailResponse>
  >(`admin/qnas/${qnaId}`);

  return unwrap(response);
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

  return unwrap(response);
};

export const getAdminLessonBuilderFeeds = async (
  lessonId: number,
): Promise<AdminLessonBuilderFeedsResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminLessonBuilderFeedsResponse>
  >(`admin/lessons/${lessonId}/builder-feeds`);

  return unwrap(response);
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
