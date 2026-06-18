import type { CourseDetailResponse } from '@/types/api/course.types';

export function isAdminViewer(course?: CourseDetailResponse): boolean {
  return course?.viewerStatus === 'ADMIN';
}

export function isCourseFreeEnrolled(course?: CourseDetailResponse): boolean {
  return course?.isFreeEnrolled === true;
}

export function isCoursePaidEnrolled(course?: CourseDetailResponse): boolean {
  return course?.isPaidEnrolled === true;
}

export function hasCourseFullAccess(course?: CourseDetailResponse): boolean {
  return course?.hasFullAccess === true;
}

export function canShowCourseFreeEnrollCta(
  course?: CourseDetailResponse,
): boolean {
  return course?.canFreeEnroll === true;
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
