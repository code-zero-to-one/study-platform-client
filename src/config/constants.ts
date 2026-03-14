// 스터디 상세 페이지 탭 설정
export const STUDY_DETAIL_TABS = [
  { label: '스터디 소개', value: 'intro' },
  { label: '참가자', value: 'members' },
  { label: '미션', value: 'mission' },
  { label: '라운지', value: 'lounge' },
  { label: '문의', value: 'inquiry' },
] as const;

export type StudyTabValue = (typeof STUDY_DETAIL_TABS)[number]['value'];

export const STUDY_TAB_VALUES = new Set<StudyTabValue>(
  STUDY_DETAIL_TABS.map((tab) => tab.value),
);

export const isStudyTabValue = (
  value: string | undefined,
): value is StudyTabValue => {
  if (!value) return false;

  return STUDY_TAB_VALUES.has(value as StudyTabValue);
};
