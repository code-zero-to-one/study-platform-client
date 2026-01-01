// 스터디 상세 페이지 탭 설정
export const STUDY_DETAIL_TABS = [
  { label: '스터디 소개', value: 'intro' },
  { label: '참가자', value: 'members' },
  { label: '미션', value: 'mission' },
  { label: '채널', value: 'channel' },
] as const;

export type StudyTabValue = (typeof STUDY_DETAIL_TABS)[number]['value'];
