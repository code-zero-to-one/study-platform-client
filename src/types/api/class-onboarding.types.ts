export const VIBE_EXPERIENCE_OPTIONS = [
  { value: 'CURIOUS_NO_EXPERIENCE', label: '관심은 있는데 아직 안 해봤어요' },
  {
    value: 'COPY_PASTE_WITH_AI',
    label: 'AI한테 코드 짜달라고 해서 복사 붙여넣기해봤어요',
  },
  {
    value: 'TRIED_WITH_AI_BUT_GAVE_UP',
    label: 'AI랑 같이 만들다가 막혀서 포기한 적이 있어요',
  },
  {
    value: 'BUILT_WORKING_RESULT',
    label: '원하는대로 동작하는 결과물을 만들어본 적 있어요',
  },
  {
    value: 'DEPLOYED_AND_SHARED',
    label: '배포까지 해서 실제로 쓰거나 남에게 보여준 적 있어요',
  },
] as const;

export type VibeCodingExperienceLevel =
  | (typeof VIBE_EXPERIENCE_OPTIONS)[number]['value']
  | (string & {});

export const IT_JOB_VALUES = [
  'IT_NOBASE_BUSINESS_STARTUP',
  'IT_NOBASE_AUTOMATION',
  'IT_NOBASE_MY_SERVICE',
  'IT_PRACTITIONER_PM_PO_PLANNING',
  'IT_PRACTITIONER_FRONTEND',
  'IT_PRACTITIONER_BACKEND',
  'IT_PRACTITIONER_AI_ML',
  'IT_PRACTITIONER_IOS',
  'IT_PRACTITIONER_ANDROID',
  'IT_PRACTITIONER_DEVOPS',
  'IT_PRACTITIONER_DATA_ANALYSIS',
  'IT_PRACTITIONER_QA',
  'IT_PRACTITIONER_GAME_DEV',
  'IT_PRACTITIONER_DESIGN',
  'IT_PRACTITIONER_MARKETING',
  'IT_PRACTITIONER_ETC',
] as const;

export const JOB_OPTIONS = [
  { value: 'CLASS_ONBOARDING_DESIGNER', label: '디자이너' },
  { value: 'CLASS_ONBOARDING_MARKETER', label: '마케터' },
  {
    value: 'CLASS_ONBOARDING_SERVICE_PLANNER_PM_PO',
    label: '서비스 기획자/PM/PO',
  },
  { value: 'CLASS_ONBOARDING_STUDENT_JOB_SEEKER', label: '학생/취업준비생' },
  { value: 'CLASS_ONBOARDING_ENTREPRENEUR', label: '창업가/예비 창업자' },
  {
    value: 'CLASS_ONBOARDING_NON_MAJOR_SELF_DEVELOPMENT',
    label: '비전공/자기개발',
  },
  { value: 'CLASS_ONBOARDING_DEVELOPER', label: '개발자' },
] as const;

export type ClassOnboardingJob =
  | (typeof JOB_OPTIONS)[number]['value']
  | (typeof IT_JOB_VALUES)[number]
  | (string & {});

export const CAREER_OPTIONS = [
  { value: 'JOB_SEEKER', label: '학생/취업준비생' },
  { value: 'JUNIOR', label: '주니어(0~3년)' },
  { value: 'MIDDLE', label: '미들(3~5년)' },
  { value: 'SENIOR', label: '시니어(5년~)' },
  { value: 'RETIRED', label: '퇴직자' },
] as const;

export type ClassOnboardingCareer =
  | (typeof CAREER_OPTIONS)[number]['value']
  | (string & {});

export const INTEREST_OPTIONS = [
  { value: 'PORTFOLIO_SITE', label: '내 포트폴리오 사이트' },
  { value: 'SIDE_PROJECT_WEB_APP', label: '사이드 프로젝트 웹/앱' },
  { value: 'WORK_AUTOMATION_TOOL', label: '업무 자동화 도구' },
  { value: 'MONETIZATION_SERVICE', label: '수익화 서비스(창업, 부업)' },
  { value: 'OTHER', label: '기타(상세 내용 기재)' },
] as const;

export type ClassOnboardingInterest =
  | (typeof INTEREST_OPTIONS)[number]['value']
  | (string & {});

export interface ClassOnboardingStep1Request {
  nickname: string;
  privacyConsent: boolean;
  termsConsent: boolean;
  marketingConsent: boolean;
  vibeCodingExperienceLevel: VibeCodingExperienceLevel;
}

export interface ClassOnboardingStep2Request {
  jobs: ClassOnboardingJob[];
  jobEtcText?: string;
  career: ClassOnboardingCareer;
}

export interface ClassOnboardingStep3Request {
  interests: ClassOnboardingInterest[];
  interestEtcText?: string;
}

export interface ClassOnboardingCompleteRequest {
  confirmedOnboardingCompletion: boolean;
}

export interface ClassOnboardingStepResponse {
  savedStep: string;
  nextStep: string;
  savedNickname: string;
  savedJobs: ClassOnboardingJob[];
  savedInterests: ClassOnboardingInterest[];
}
