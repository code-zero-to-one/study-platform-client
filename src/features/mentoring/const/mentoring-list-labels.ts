export const MENTORING_LIST_LABELS = {
  searchPlaceholder: '기술 검색',
  noSearchResultTitle: '검색 결과가 없어요',
  noSearchResultDescription: '다른 키워드로 다시 검색해보세요.',
  joinBadge: '멘토 등록',
  joinTitle: '멘토로 합류하세요',
  joinDescription: '실무 경험으로 멘티의 커리어 방향을 잡아주세요.',
  joinMeta: '1:1 멘토링 · 일정 기반 운영',
  joinCta: '멘토 등록하기',
  joinMethods: ['쪽지상담', '전화상담', '온라인상담'] as const,
  recruitCaption: '멘토 모집 중',
} as const;

export const MENTORING_LIST_ERROR_MESSAGES = {
  loginRequired: '로그인 후 멘토 등록이 가능합니다.',
  roleRequired: '멘토/관리자 권한이 필요합니다.',
  memberInfoMissing: '회원 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
  verificationUnavailable:
    '본인인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
  verificationRequired: '멘토 등록 전 본인인증이 필요합니다.',
} as const;
