import { createEmptyWeeklySchedule } from '@/features/mentoring/model/mentor-settings';
import { createEmptyMentorScheduleDrafts } from '@/types/schemas/mentor-registration-schema';
import { type MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

export const ADMIN_MENTORING_MOCK_SEED_TAG = 'ADMIN_MENTORING_SERVER_LIKE_V1';

export const createServerLikeMentorRegistrationValues = (
  nowIso: string,
): MentorRegistrationFormValues => {
  const weekly = createEmptyWeeklySchedule();

  weekly.MON = ['20:00', '20:30', '21:00'];
  weekly.TUE = ['21:00', '21:30'];
  weekly.WED = ['20:00', '20:30'];
  weekly.THU = ['21:00', '21:30', '22:00'];
  weekly.SAT = ['11:00', '11:30', '12:00'];

  return {
    categories: ['커리어', '포트폴리오', '면접'],
    mentoringTitle: '백엔드/커리어 전환 실무형 멘토링 (서류·면접·포트폴리오)',
    appealLine: '백엔드 커리어 전환 멘토',
    jobGroup: '백엔드/서버 개발자',
    jobTitle: '시니어 백엔드 엔지니어',
    careerYears: '시니어 (9년 이상)',
    careerEntries: [
      {
        description: 'ZERO-ONE 백엔드 리드',
        isCurrent: true,
        periodEnabled: false,
        startMonth: '',
        endMonth: '',
      },
      {
        description: '카카오엔터프라이즈 백엔드 플랫폼 개발',
        isCurrent: false,
        periodEnabled: false,
        startMonth: '',
        endMonth: '',
      },
    ],
    skillTags: ['Java', 'Spring', 'Kotlin', 'MySQL', '시스템설계'],
    companyCategory: '기타',
    companyName: '',
    hideCompanyName: true,
    listVisible: true,
    maxParticipants: 2,
    noteEnabled: true,
    notePrice: 29000,
    simpleEnabled: true,
    simplePrice: 39000,
    deepEnabled: true,
    deepPrice: 59000,
    deepDurationMinutes: 60,
    offlineEnabled: true,
    offlinePrice: 99000,
    offlineDurationMinutes: 60,
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly,
    },
    scheduleDrafts: createEmptyMentorScheduleDrafts(),
    detailedDescription: `실제 채용 과정에서 많이 막히는 이력서 구조화, 프로젝트 성과 정리, 기술면접 답변 설계를 중심으로 진행합니다.

멘티 상황에 맞춰 우선순위를 짚고, 바로 적용 가능한 액션 아이템으로 정리해드립니다.`,
    interviewQuestions: [
      '최근 3개월 내 가장 고민한 커리어 이슈는 무엇인가요?',
      '현재 이력서에서 가장 약하다고 느끼는 섹션은 어디인가요?',
      '이번 멘토링에서 꼭 해결하고 싶은 목표를 적어주세요.',
    ],
    preNotice: '',
    updatedAt: nowIso,
  };
};
