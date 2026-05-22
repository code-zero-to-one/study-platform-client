import { describe, expect, it } from 'vitest';
import type { CourseDetailResponse } from '@/types/api/course.types';
import {
  canShowCourseFreeEnrollCta,
  getCourseViewerStatusLabel,
  hasCourseFullAccess,
  isCourseFreeEnrolled,
  isCoursePaidEnrolled,
} from './course-viewer-status';

const baseCourse: CourseDetailResponse = {
  courseId: 1,
  slug: 'sample-course',
  viewerStatus: 'LOGIN_ONLY',
  title: 'Sample',
  description: null,
  thumbnailUrl: null,
  learnerCount: null,
  durationDays: null,
  completionCount: null,
  exploringCount: null,
  plans: null,
  earlyBirdEndsAt: null,
  canFreeEnroll: null,
  isFreeEnrolled: null,
  freeLessonCount: null,
  journeyMapAvailable: null,
  hasFullAccess: null,
  isPaidEnrolled: null,
  canPurchase: null,
};

describe('course viewer status helpers', () => {
  it('ADMIN is full-access but not an actual learner by default', () => {
    const course = {
      ...baseCourse,
      viewerStatus: 'ADMIN',
      hasFullAccess: true,
      canFreeEnroll: true,
    } satisfies CourseDetailResponse;

    expect(hasCourseFullAccess(course)).toBe(true);
    expect(isCourseFreeEnrolled(course)).toBe(false);
    expect(isCoursePaidEnrolled(course)).toBe(false);
    expect(canShowCourseFreeEnrollCta(course)).toBe(true);
    expect(getCourseViewerStatusLabel(course)).toBe(
      '관리자 권한으로 미리보기 중',
    );
  });

  it('ADMIN free enrollment keeps ADMIN status and becomes a real free learner', () => {
    const course = {
      ...baseCourse,
      viewerStatus: 'ADMIN',
      hasFullAccess: true,
      canFreeEnroll: null as CourseDetailResponse['canFreeEnroll'],
      isFreeEnrolled: true,
    } satisfies CourseDetailResponse;

    expect(isCourseFreeEnrolled(course)).toBe(true);
    expect(canShowCourseFreeEnrollCta(course)).toBe(false);
    expect(getCourseViewerStatusLabel(course)).toBe('무료수강중');
  });

  it('PAID means actual paid learner', () => {
    const course = {
      ...baseCourse,
      viewerStatus: 'PAID',
      isPaidEnrolled: true,
      hasFullAccess: true,
    } satisfies CourseDetailResponse;

    expect(isCoursePaidEnrolled(course)).toBe(true);
    expect(hasCourseFullAccess(course)).toBe(true);
    expect(getCourseViewerStatusLabel(course)).toBe('결제 수강중');
  });
});
