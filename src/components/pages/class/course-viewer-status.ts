import type { CourseDetailResponse } from '@/types/api/course.types';

export function isAdminViewer(course?: CourseDetailResponse): boolean {
  return course?.viewerStatus === 'ADMIN';
}

export function isCourseFreeEnrolled(course?: CourseDetailResponse): boolean {
  return (
    course?.isFreeEnrolled === true || course?.viewerStatus === 'FREE_ENROLLED'
  );
}

export function isCoursePaidEnrolled(course?: CourseDetailResponse): boolean {
  return course?.isPaidEnrolled === true || course?.viewerStatus === 'PAID';
}

export function hasCourseFullAccess(course?: CourseDetailResponse): boolean {
  return (
    course?.hasFullAccess === true ||
    isAdminViewer(course) ||
    isCoursePaidEnrolled(course)
  );
}

export function canShowCourseFreeEnrollCta(
  course?: CourseDetailResponse,
): boolean {
  if (course?.canFreeEnroll !== true) return false;
  if (isCourseFreeEnrolled(course) || isCoursePaidEnrolled(course)) {
    return false;
  }
  return (
    course.viewerStatus === 'LOGIN_ONLY' || course.viewerStatus === 'ADMIN'
  );
}

export function getCourseViewerStatusLabel(
  course?: CourseDetailResponse,
): string | undefined {
  if (!course) return undefined;

  if (isAdminViewer(course)) {
    if (isCoursePaidEnrolled(course)) return '결제 수강중';
    if (isCourseFreeEnrolled(course)) return '무료수강중';
    return '관리자 권한으로 미리보기 중';
  }

  if (isCoursePaidEnrolled(course)) return '결제 수강중';
  if (isCourseFreeEnrolled(course)) return '무료수강중';
  return undefined;
}
