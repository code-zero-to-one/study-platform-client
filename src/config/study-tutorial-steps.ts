import type { TutorialStep } from '@/features/study/one-to-one/schedule/ui/tutorial';

export const STUDY_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'recruiting',
    title: '스터디 모집 단계',
    description:
      '신청 목록에 들어오면 주말에 파트너가 매칭됩니다. 지금은 모집 상태를 확인해 주세요.',
    targetSelector: '[data-tutorial="study-recruit-list"]',
    placement: 'bottom',
    align: 'start',
    scrollBlock: 'end',
    spotlightPadding: 16,
    spotlightRadius: 16,
  },
  {
    id: 'studying',
    title: '스터디 진행 단계',
    description:
      '매칭이 되면 카카오 알림이 오고, 한 주간 면접관과 지원자 역할을 수행합니다.',
    targetSelector: '[data-tutorial="study-progress-list"]',
    placement: 'top',
    align: 'start',
  },
  {
    id: 'contact',
    title: '연락하기',
    description: '연락하기 버튼으로 상대방과 일정과 진행 방식을 정리해 주세요.',
    targetSelector: '[data-tutorial="study-contact-button"]',
    placement: 'top',
    align: 'center',
  },
  {
    id: 'prepare',
    title: '지원자 준비하기',
    description: '지원자는 전날 면접 주제를 정하고 참고 자료를 준비합니다.',
    targetSelector: '[data-tutorial="study-ready-input"]',
    placement: 'top',
    align: 'center',
    spotlightPadding: 16,
    spotlightRadius: 12,
  },
  {
    id: 'complete',
    title: '면접 완료하기',
    description: '면접관은 질문을 진행하고 완료하기로 피드백을 남깁니다.',
    targetSelector: '[data-tutorial="study-done-input"]',
    placement: 'top',
    align: 'center',
    spotlightPadding: 20,
    spotlightRadius: 12,
  },
];

export interface StudyTutorialScenario {
  forcedStatus: 'RECRUITING' | 'STUDYING';
  forcedRole: 'INTERVIEWER' | 'INTERVIEWEE';
  forceOpenReadyModal: boolean;
  forceOpenDoneModal: boolean;
}

export const getStudyTutorialScenario = (
  stepIndex: number,
): StudyTutorialScenario => ({
  forcedStatus: stepIndex === 0 ? 'RECRUITING' : 'STUDYING',
  forcedRole: stepIndex >= 4 ? 'INTERVIEWER' : 'INTERVIEWEE',
  forceOpenReadyModal: stepIndex === 3,
  forceOpenDoneModal: stepIndex === 4,
});
