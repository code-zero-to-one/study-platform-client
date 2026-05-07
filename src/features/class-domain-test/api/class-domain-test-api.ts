import { isAxiosError } from 'axios';
import { axiosInstance } from '@/api/client/axios';

// Backend class API uses JSON null for intentionally empty DTO fields.
// eslint-disable-next-line @rushstack/no-new-null
type ApiNullable<T> = T | null;

interface BaseResponse<T> {
  statusCode: number;
  timestamp?: string;
  content: T;
  message?: string;
}

export type ClassCourseStatus = 'OPEN' | 'COMING_SOON';
export type ClassViewerStatus =
  | 'ANONYMOUS'
  | 'LOGIN_ONLY'
  | 'FREE_ENROLLED'
  | 'PAID';

export interface ClassCourseSummary {
  courseId: number;
  slug: string;
  title: string;
  thumbnailUrl: ApiNullable<string>;
  status: ClassCourseStatus;
}

export interface ClassPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ClassPlanItem {
  code: string;
  label: string;
  valueAmount: number;
}

export interface ClassPlan {
  planCode: string;
  name: string;
  subtitle: ApiNullable<string>;
  items: ClassPlanItem[];
  listTotalAmount: number;
  earlyBirdPrice: ApiNullable<number>;
  regularPriceAfterEb: ApiNullable<number>;
  discountRate: ApiNullable<number>;
}

export interface ClassCourseDetail {
  courseId: number;
  slug: string;
  viewerStatus: ClassViewerStatus;
  title: string;
  description: ApiNullable<string>;
  thumbnailUrl: ApiNullable<string>;
  plans?: ClassPlan[];
  earlyBirdEndsAt?: ApiNullable<string>;
  freeEnrollmentAvailable?: ApiNullable<boolean>;
  freeEnrolled?: ApiNullable<boolean>;
  freeLessonCount?: ApiNullable<number>;
  isEnrolled?: ApiNullable<boolean>;
  journeyMapEnabled?: ApiNullable<boolean>;
  fullAccess?: ApiNullable<boolean>;
  purchaseAvailable?: ApiNullable<boolean>;
}

export interface ClassCurriculumLesson {
  lessonId: number;
  order: number;
  title: string;
  isFree: boolean;
  locked: boolean;
  estimatedMinutes: number;
}

export interface ClassCurriculumChapter {
  chapterId: number;
  order: number;
  chapterNumber: number;
  title: string;
  estimatedMinutes: number;
  lessons: ClassCurriculumLesson[];
}

export interface ClassCurriculum {
  courseId: number;
  durationDays: number;
  totalChapters: number;
  totalLessons: number;
  chapters: ClassCurriculumChapter[];
}

export interface ClassApiError {
  status?: number;
  message: string;
}

export interface ClassAdminCreateResult {
  slug: string;
  courseId: number;
  lessonIds: number[];
}

export const getClassCourses = async () => {
  const { data } = await axiosInstance.get<
    BaseResponse<ClassPageResponse<ClassCourseSummary>>
  >('/courses', {
    params: {
      status: 'OPEN',
      page: 0,
      size: 20,
    },
  });

  return data.content;
};

export const getClassCourseDetail = async (slug: string) => {
  const { data } = await axiosInstance.get<BaseResponse<ClassCourseDetail>>(
    `/courses/${slug}`,
  );

  return data.content;
};

export const getClassCurriculum = async (slug: string) => {
  const { data } = await axiosInstance.get<BaseResponse<ClassCurriculum>>(
    `/courses/${slug}/curriculum`,
  );

  return data.content;
};

export const loginClassAdminTestMember = async () => {
  const { data } = await axiosInstance.post<
    BaseResponse<{ accessToken: string }>
  >('/growth/test/login', {
    memberId: 1,
  });

  return data.content.accessToken;
};

export const createClassAdminSample = async (
  accessToken: string,
): Promise<ClassAdminCreateResult> => {
  const slug = `class-test-${Date.now()}`;
  const authorization = {
    Authorization: `Bearer ${accessToken}`,
  };
  const { data: courseData } = await axiosInstance.post<
    BaseResponse<{ courseId: number }>
  >(
    '/admin/courses',
    {
      slug,
      title: `브라우저 테스트 클래스 ${new Date().toLocaleTimeString()}`,
      description: 'class-test 페이지에서 운영자 API로 생성한 임시 클래스',
      thumbnailUrl: 'https://cdn.example.com/class-test.png',
      status: 'OPEN',
      durationDays: 5,
      earlyBirdEndsAt: '2026-06-30T23:59:00+09:00',
    },
    { headers: authorization },
  );
  const courseId = courseData.content.courseId;
  const { data: freeLessonData } = await axiosInstance.post<
    BaseResponse<{ lessonId: number }>
  >(
    `/admin/courses/${courseId}/lessons`,
    {
      chapterNumber: 1,
      lessonNumber: 1,
      title: '무료 첫 레슨',
      content: '운영자가 브라우저에서 입력한 무료 레슨 본문',
      estimatedMinutes: 25,
      isFree: true,
      isPublished: true,
    },
    { headers: authorization },
  );
  const { data: paidLessonData } = await axiosInstance.post<
    BaseResponse<{ lessonId: number }>
  >(
    `/admin/courses/${courseId}/lessons`,
    {
      chapterNumber: 1,
      lessonNumber: 2,
      title: '유료 둘째 레슨',
      content: '운영자가 브라우저에서 입력한 유료 레슨 본문',
      estimatedMinutes: 35,
      isFree: false,
      isPublished: true,
    },
    { headers: authorization },
  );

  await axiosInstance.put(
    `/admin/courses/${courseId}/completion-message`,
    {
      message: '완주를 축하합니다. 다음 도전을 시작하세요.',
    },
    { headers: authorization },
  );

  return {
    slug,
    courseId,
    lessonIds: [
      freeLessonData.content.lessonId,
      paidLessonData.content.lessonId,
    ],
  };
};

export const toClassApiError = (error: unknown): ClassApiError => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; errorCode?: string }
      | undefined;
    return {
      status: error.response?.status,
      message:
        responseData?.message ??
        responseData?.errorCode ??
        error.message ??
        'API 요청에 실패했습니다.',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
  };
};
