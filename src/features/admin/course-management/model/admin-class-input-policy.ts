import type {
  AdminCourseUpsertRequest,
  AdminLessonUpsertRequest,
} from '@/features/admin/course-management/model/admin-course-management-contract';

const COURSE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_URL_PATTERN = /^https?:\/\//;

const isPositiveInteger = (value: unknown) =>
  Number.isInteger(value) && Number(value) >= 1;

export const CLASS_INPUT_LIMITS = {
  course: {
    slugMax: 100,
    titleMax: 150,
    cardHeadlineMax: 200,
    cardSummaryMax: 200,
    cardTagMaxCount: 10,
    cardTagMaxLength: 30,
    descriptionMax: 2000,
    thumbnailUrlMax: 500,
    completionMessageMax: 200,
  },
  lesson: {
    titleMax: 150,
  },
} as const;

export const getAdminCoursePayloadValidationError = (
  payload: AdminCourseUpsertRequest,
) => {
  if (!payload.slug.trim()) return 'Slug를 입력해주세요.';
  if (payload.slug.length > CLASS_INPUT_LIMITS.course.slugMax) {
    return 'Slug는 100자 이내로 입력해주세요.';
  }
  if (!COURSE_SLUG_PATTERN.test(payload.slug)) {
    return 'Slug는 영소문자, 숫자, 하이픈만 사용할 수 있고 하이픈으로 시작/끝날 수 없습니다.';
  }

  if (!payload.title.trim()) return '제목을 입력해주세요.';
  if (payload.title.length > CLASS_INPUT_LIMITS.course.titleMax) {
    return '제목은 150자 이내로 입력해주세요.';
  }

  if (payload.cardHeadline.length > CLASS_INPUT_LIMITS.course.cardHeadlineMax) {
    return '카드 헤드라인은 200자 이내로 입력해주세요.';
  }
  if (payload.cardSummary.length > CLASS_INPUT_LIMITS.course.cardSummaryMax) {
    return '카드 요약은 200자 이내로 입력해주세요.';
  }
  if (payload.cardTags.length > CLASS_INPUT_LIMITS.course.cardTagMaxCount) {
    return '카드 태그는 최대 10개까지 추가할 수 있습니다.';
  }
  if (
    payload.cardTags.some(
      (tag) => tag.length > CLASS_INPUT_LIMITS.course.cardTagMaxLength,
    )
  ) {
    return '카드 태그는 각 30자 이내로 입력해주세요.';
  }

  if (
    typeof payload.regularPrice === 'number' &&
    !isPositiveInteger(payload.regularPrice)
  ) {
    return '정가는 1 이상의 정수로 입력해주세요.';
  }
  if (
    typeof payload.discountPrice === 'number' &&
    !isPositiveInteger(payload.discountPrice)
  ) {
    return '할인가는 1 이상의 정수로 입력해주세요.';
  }
  if (payload.description.length > CLASS_INPUT_LIMITS.course.descriptionMax) {
    return '공개 상세 설명은 2000자 이내로 입력해주세요.';
  }
  if (payload.thumbnailUrl.length > CLASS_INPUT_LIMITS.course.thumbnailUrlMax) {
    return '썸네일 URL은 500자 이내여야 합니다.';
  }
  if (payload.thumbnailUrl && !HTTP_URL_PATTERN.test(payload.thumbnailUrl)) {
    return '썸네일 URL은 http:// 또는 https:// 형식이어야 합니다.';
  }
  if (
    typeof payload.durationDays === 'number' &&
    !isPositiveInteger(payload.durationDays)
  ) {
    return '기간은 1일 이상의 정수로 입력해주세요.';
  }

  return undefined;
};

export const getAdminCompletionMessageValidationError = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return '완주 메시지를 입력해주세요.';
  if (trimmedMessage.length > CLASS_INPUT_LIMITS.course.completionMessageMax) {
    return '완주 메시지는 200자 이내로 입력해주세요.';
  }

  return undefined;
};

export const getAdminLessonInputPolicyValidationError = (
  payload: AdminLessonUpsertRequest,
) => {
  if (!isPositiveInteger(payload.chapterNumber)) {
    return '챕터 번호는 1 이상의 정수로 입력해주세요.';
  }
  if (
    payload.lessonNumber !== undefined &&
    !isPositiveInteger(payload.lessonNumber)
  ) {
    return '레슨 번호는 1 이상의 정수로 입력해주세요. 생성 시 비우면 자동 채번됩니다.';
  }
  if (!payload.title.trim()) return '레슨 제목을 입력해주세요.';
  if (payload.title.trim().length > CLASS_INPUT_LIMITS.lesson.titleMax) {
    return '레슨 제목은 150자 이내로 입력해주세요.';
  }
  if (
    payload.estimatedMinutes !== undefined &&
    !isPositiveInteger(payload.estimatedMinutes)
  ) {
    return '예상 시간은 1분 이상의 정수로 입력해주세요.';
  }

  return undefined;
};
