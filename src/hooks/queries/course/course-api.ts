import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/api/client/axios';
import type {
  BuilderFeedCommentsResponse,
  BuilderFeedCreateRequest,
  BuilderFeedDetailResponse,
  BuilderFeedListResponse,
  CourseCompletionRecapResponse,
  CourseCurriculumResponse,
  CourseDetailResponse,
  CourseDrawerResponse,
  CourseJourneyMapResponse,
  CourseProgressResponse,
  LessonDetailResponse,
  LessonQnaCreateRequest,
  LessonQnaListResponse,
  LessonRetrospectiveCreateRequest,
  LessonRetrospectiveResponse,
} from '@/types/api/course.types';

// ─── Course Detail ────────────────────────────────────────────────────────────

export const useGetCourseDetail = (slug: string) => {
  return useQuery({
    queryKey: ['courseDetail', slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<{
        content: CourseDrawerResponse;
      }>(`courses/${courseId}/drawer`);
      return data.content;
    },
    enabled: !!courseId,
  });
};

// ─── Journey Map ──────────────────────────────────────────────────────────────

export const useGetCourseJourneyMap = (courseId: number) => {
  return useQuery({
    queryKey: ['courseJourneyMap', courseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.post<{ content: unknown }>(
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.post<{
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

export const useGetLessonQnas = (lessonId: number) => {
  return useQuery({
    queryKey: ['lessonQnas', lessonId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: LessonQnaListResponse;
      }>(`lessons/${lessonId}/qnas`);
      return data.content;
    },
    enabled: !!lessonId,
  });
};

export const useCreateLessonQna = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      request,
    }: {
      lessonId: number;
      request: LessonQnaCreateRequest;
    }) => {
      const { data } = await axiosInstance.post<{ content: { qnaId: number } }>(
        `lessons/${lessonId}/qnas`,
        request,
      );
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['lessonQnas', variables.lessonId],
      });
    },
  });
};

// ─── Builder Feed ─────────────────────────────────────────────────────────────

export const useGetBuilderFeeds = ({
  courseId,
  sort,
  lessonId,
  page = 0,
  size = 6,
}: {
  courseId: number;
  sort?: string;
  lessonId?: number;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: ['builderFeeds', courseId, sort, lessonId, page, size],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: BuilderFeedListResponse;
      }>(`courses/${courseId}/builder-feeds`, {
        params: { sort, lessonId, page, size },
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
      const { data } = await axiosInstance.post<{
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
      const { data } = await axiosInstance.get<{
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
      const { data } = await axiosInstance.post<{
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
      const { data } = await axiosInstance.get<{
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
      content,
    }: {
      feedId: number;
      content: string;
    }) => {
      const { data } = await axiosInstance.post<{
        content: { commentId: number };
      }>(`builder-feeds/${feedId}/comments`, { content });
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['feedComments', variables.feedId],
      });
    },
  });
};
