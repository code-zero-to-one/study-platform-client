import type { AdminRetrospectivePurpose } from '@/features/admin/course-management/model/admin-course-management-contract';

export const ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS: Array<{
  value: AdminRetrospectivePurpose;
  label: string;
  helper: string;
  color: 'blue' | 'green' | 'orange';
}> = [
  {
    value: 'PRACTICAL',
    label: '실습 인증',
    helper: '링크 또는 스크린샷 제출이 필수입니다.',
    color: 'blue',
  },
  {
    value: 'THEORY',
    label: '이론',
    helper: '텍스트 답변만 제출하고 링크/스크린샷 입력은 숨깁니다.',
    color: 'green',
  },
  {
    value: 'OTHER',
    label: '기타',
    helper: '자유 피드백만 받습니다. 링크/스크린샷·질문 답변은 숨깁니다.',
    color: 'orange',
  },
];

// 백엔드 RetrospectivePurpose.normalized()와 동일하게 옛 6값 → 새 3값으로 매핑.
// (옛 값으로 저장된 레슨도 폼/표시에서 유효한 값으로 다루기 위함)
export const normalizeAdminRetrospectivePurpose = (
  raw?: string | null,
): AdminRetrospectivePurpose => {
  switch (raw) {
    case 'THEORY':
    case 'SUBJECTIVE_QUIZ':
      return 'THEORY';
    case 'OTHER':
      return 'OTHER';
    default:
      // PRACTICAL, PRACTICE_PROOF, ARTIFACT_SHARE, null/undefined 등
      return 'PRACTICAL';
  }
};

export const getAdminRetrospectivePurposeMeta = (purpose?: string | null) => {
  const normalized = normalizeAdminRetrospectivePurpose(purpose);
  return (
    ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS.find(
      (option) => option.value === normalized,
    ) ?? ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS[0]
  );
};
