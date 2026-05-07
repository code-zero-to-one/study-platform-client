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
