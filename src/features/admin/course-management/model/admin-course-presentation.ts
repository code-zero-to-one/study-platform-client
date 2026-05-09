import type { AdminRetrospectivePurpose } from '@/features/admin/course-management/model/admin-course-management-contract';

export const ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS: Array<{
  value: AdminRetrospectivePurpose;
  label: string;
  helper: string;
  color: 'blue' | 'green' | 'orange';
}> = [
  {
    value: 'PRACTICE_PROOF',
    label: '실습 인증',
    helper: '링크 또는 스크린샷 제출이 필수입니다.',
    color: 'blue',
  },
  {
    value: 'ARTIFACT_SHARE',
    label: '결과물 자랑',
    helper: '링크 또는 스크린샷 제출이 필수입니다.',
    color: 'green',
  },
  {
    value: 'SUBJECTIVE_QUIZ',
    label: '주관식 퀴즈',
    helper: '텍스트 답변만 제출하고 링크/스크린샷 입력은 숨깁니다.',
    color: 'orange',
  },
];

export const getAdminRetrospectivePurposeMeta = (
  purpose: AdminRetrospectivePurpose,
) =>
  ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS.find(
    (option) => option.value === purpose,
  ) ?? ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS[0];
