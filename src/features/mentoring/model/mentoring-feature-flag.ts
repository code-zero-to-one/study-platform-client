export const isMentoringApplyEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_MENTORING_APPLY === 'true';
};

export const isMentoringNoteConsultationEnabled = () => {
  // 현재 제품 범위에 포함되지 않는 기능이라 항상 닫아 둡니다.
  // 로컬 mock/store가 있더라도 서비스 화면으로 노출하지 않습니다.
  return false;
};

export const isMentoringAdminMockEnabled = () => {
  // 관리자용 멘토 심사/운영 화면도 현재 제품 범위 밖이라 항상 닫아 둡니다.
  return false;
};
