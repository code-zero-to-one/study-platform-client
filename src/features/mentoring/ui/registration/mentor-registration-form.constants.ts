import type { FieldPath } from 'react-hook-form';
import { createDefaultMentorSettings } from '@/features/mentoring/model/mentor-settings';
import {
  type MentorRegistrationMethodField,
  type MentorRegistrationStepId,
  type MentorRegistrationVisibleStepId,
  MENTOR_REGISTRATION_STEP_IDS,
} from '@/types/mentoring/registration-view';
import type { MentorRegistrationFormInputValues } from '@/types/schemas/mentor-registration-schema';

export interface MentorRegistrationStepMeta {
  id: MentorRegistrationVisibleStepId;
  title: string;
  description: string;
  previewSection?: 'headline' | 'methods' | 'description' | 'interview';
}

export const METHOD_FIELDS: MentorRegistrationMethodField[] = [
  {
    enabledField: 'noteEnabled',
    priceField: 'notePrice',
    label: '쪽지상담',
    description:
      '미리 질문/고민/자료를 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
    policySummary: '결제 후 멘토의 첫 답장이 수락 처리됩니다.',
  },
  {
    enabledField: 'simpleEnabled',
    priceField: 'simplePrice',
    label: '간편상담',
    description:
      '허들을 낮춘 빠른 상담 방식입니다. 질문/자료를 선제출하고 15분 내 핵심 피드백을 받습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'deepEnabled',
    priceField: 'deepPrice',
    durationField: 'deepDurationMinutes',
    label: '심층상담',
    description:
      '화면/코드를 함께 보며 피드백을 주고받는 방식입니다. 30/60/90분 중 선택합니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'offlineEnabled',
    priceField: 'offlinePrice',
    durationField: 'offlineDurationMinutes',
    label: '대면상담',
    description:
      '커피챗/심층 상담 방식입니다. 필요 시 세일즈 제안 목적 상담으로도 활용할 수 있습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
];

export const DEFAULT_SCHEDULE = createDefaultMentorSettings().schedule;

export const MENTOR_REGISTRATION_STEPS: MentorRegistrationStepMeta[] = [
  {
    id: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    title: '기본정보',
    description: '멘티가 가장 먼저 확인하는 핵심 소개를 입력합니다.',
    previewSection: 'headline',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    title: '멘토정보',
    description: '포지션, 핵심 키워드, 주요 이력을 설정합니다.',
    previewSection: 'headline',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    title: '멘토 소개',
    description: '멘토 소개와 상담 전 준비사항을 함께 작성합니다.',
    previewSection: 'description',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    title: '가격/시간',
    description:
      '상담 방식과 금액을 먼저 정하면 다음 단계의 스케줄 필요 여부가 결정됩니다.',
    previewSection: 'methods',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.schedule,
    title: '스케줄 설정',
    description:
      '간편/심층/대면 상담을 켠 경우에만 상담 가능 시간을 30분 단위로 고릅니다.',
    previewSection: 'methods',
  },
  {
    id: MENTOR_REGISTRATION_STEP_IDS.settlement,
    title: '정산정보 (추후 제공)',
    description: '정산정보 기능은 추후 제공 예정입니다.',
  },
];

export const STEP_FIELD_PATHS: Record<
  MentorRegistrationStepId,
  FieldPath<MentorRegistrationFormInputValues>[]
> = {
  [MENTOR_REGISTRATION_STEP_IDS.basicInformation]: [
    'mentoringTitle',
    'appealLine',
    'listVisible',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]: [
    'jobGroup',
    'jobTitle',
    'careerYears',
    'careerEntries',
    'skillTags',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]: [
    'detailedDescription',
    'interviewQuestions',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.schedule]: ['schedule'],
  [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]: [
    'noteEnabled',
    'notePrice',
    'simpleEnabled',
    'simplePrice',
    'deepEnabled',
    'deepPrice',
    'deepDurationMinutes',
    'offlineEnabled',
    'offlinePrice',
    'offlineDurationMinutes',
  ],
  [MENTOR_REGISTRATION_STEP_IDS.settlement]: [],
};

export const FIELD_PATH_TO_STEP_ID: Record<string, MentorRegistrationStepId> = {
  mentoringTitle: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  appealLine: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  listVisible: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  jobGroup: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  jobTitle: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  careerYears: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  careerEntries: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  skillTags: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  noteEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  notePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  simpleEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  simplePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepPrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  deepDurationMinutes: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlineEnabled: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlinePrice: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  offlineDurationMinutes: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
  detailedDescription: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
  interviewQuestions: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
  schedule: MENTOR_REGISTRATION_STEP_IDS.schedule,
};

export const resolveStepIdFromFieldPath = (
  fieldPath: string | undefined,
): MentorRegistrationStepId | undefined => {
  if (!fieldPath) {
    return undefined;
  }

  const [topLevelField] = fieldPath.split('.');

  return FIELD_PATH_TO_STEP_ID[topLevelField];
};
