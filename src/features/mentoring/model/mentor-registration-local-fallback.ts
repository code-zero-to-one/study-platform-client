import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

const LOCAL_MENTOR_REGISTRATION_OPTIONS: MentorRegistrationOptions = {
  maxCoreKeywordCount: 5,
  jobGroups: [
    {
      code: 'FRONTEND',
      label: '프론트엔드 개발',
      displayOrder: 1,
      active: true,
    },
    {
      code: 'BACKEND',
      label: '백엔드/서버 개발',
      displayOrder: 2,
      active: true,
    },
    {
      code: 'MOBILE',
      label: '모바일 개발',
      displayOrder: 3,
      active: true,
    },
    {
      code: 'PRODUCT',
      label: 'PM·서비스 기획',
      displayOrder: 4,
      active: true,
    },
    {
      code: 'DESIGN',
      label: 'UX/UI 디자인',
      displayOrder: 5,
      active: true,
    },
  ],
  jobTitles: [
    {
      code: 'FE_ENGINEER',
      jobGroupCode: 'FRONTEND',
      label: '프론트엔드 엔지니어',
      displayOrder: 1,
      active: true,
    },
    {
      code: 'REACT_ENGINEER',
      jobGroupCode: 'FRONTEND',
      label: 'React/Next.js 엔지니어',
      displayOrder: 2,
      active: true,
    },
    {
      code: 'BE_ENGINEER',
      jobGroupCode: 'BACKEND',
      label: '백엔드 엔지니어',
      displayOrder: 1,
      active: true,
    },
    {
      code: 'SPRING_ENGINEER',
      jobGroupCode: 'BACKEND',
      label: 'Java/Spring 엔지니어',
      displayOrder: 2,
      active: true,
    },
    {
      code: 'APP_ENGINEER',
      jobGroupCode: 'MOBILE',
      label: 'iOS/Android 엔지니어',
      displayOrder: 1,
      active: true,
    },
    {
      code: 'PM',
      jobGroupCode: 'PRODUCT',
      label: '프로덕트 매니저',
      displayOrder: 1,
      active: true,
    },
    {
      code: 'DESIGNER',
      jobGroupCode: 'DESIGN',
      label: '프로덕트 디자이너',
      displayOrder: 1,
      active: true,
    },
  ],
  careers: [
    {
      code: 'JUNIOR',
      label: '주니어 (3년 이하)',
      minYears: 0,
      maxYears: 3,
      displayOrder: 1,
      active: true,
    },
    {
      code: 'MIDDLE',
      label: '미들 (4~6년차)',
      minYears: 4,
      maxYears: 6,
      displayOrder: 2,
      active: true,
    },
    {
      code: 'SENIOR',
      label: '시니어 (7~9년차)',
      minYears: 7,
      maxYears: 9,
      displayOrder: 3,
      active: true,
    },
    {
      code: 'LEAD',
      label: '리드 (10년 이상)',
      minYears: 10,
      displayOrder: 4,
      active: true,
    },
  ],
  coreKeywords: [
    {
      code: 'REACT',
      label: 'React',
      jobGroupCodes: ['FRONTEND'],
      jobTitleCodes: ['FE_ENGINEER', 'REACT_ENGINEER'],
      displayOrder: 1,
      active: true,
    },
    {
      code: 'NEXTJS',
      label: 'Next.js',
      jobGroupCodes: ['FRONTEND'],
      jobTitleCodes: ['REACT_ENGINEER'],
      displayOrder: 2,
      active: true,
    },
    {
      code: 'TYPESCRIPT',
      label: 'TypeScript',
      jobGroupCodes: ['FRONTEND', 'BACKEND'],
      jobTitleCodes: ['FE_ENGINEER', 'REACT_ENGINEER', 'BE_ENGINEER'],
      displayOrder: 3,
      active: true,
    },
    {
      code: 'JAVA',
      label: 'Java',
      jobGroupCodes: ['BACKEND'],
      jobTitleCodes: ['BE_ENGINEER', 'SPRING_ENGINEER'],
      displayOrder: 4,
      active: true,
    },
    {
      code: 'SPRING',
      label: 'Spring',
      jobGroupCodes: ['BACKEND'],
      jobTitleCodes: ['SPRING_ENGINEER'],
      displayOrder: 5,
      active: true,
    },
    {
      code: 'SYSTEM_DESIGN',
      label: '시스템 설계',
      jobGroupCodes: ['BACKEND'],
      jobTitleCodes: ['BE_ENGINEER', 'SPRING_ENGINEER'],
      displayOrder: 6,
      active: true,
    },
    {
      code: 'KOTLIN',
      label: 'Kotlin',
      jobGroupCodes: ['BACKEND', 'MOBILE'],
      jobTitleCodes: ['SPRING_ENGINEER', 'APP_ENGINEER'],
      displayOrder: 7,
      active: true,
    },
    {
      code: 'PORTFOLIO',
      label: '포트폴리오',
      jobGroupCodes: [],
      jobTitleCodes: [],
      displayOrder: 8,
      active: true,
    },
    {
      code: 'INTERVIEW',
      label: '면접',
      jobGroupCodes: [],
      jobTitleCodes: [],
      displayOrder: 9,
      active: true,
    },
    {
      code: 'CAREER',
      label: '커리어',
      jobGroupCodes: [],
      jobTitleCodes: [],
      displayOrder: 10,
      active: true,
    },
  ],
};

export const getLocalMentorRegistrationOptions = () => {
  return LOCAL_MENTOR_REGISTRATION_OPTIONS;
};

export const findLocalMyMentorSettingsFallback = ({
  memberId,
  mentorIdByMember,
  createdMentors,
}: {
  memberId: number | undefined;
  mentorIdByMember: Record<number, number>;
  createdMentors: MentorProfile[];
}):
  | {
      mentorId: number;
      settings: MentorRegistrationFormValues;
    }
  | undefined => {
  if (!memberId) {
    return undefined;
  }

  const mentorId = mentorIdByMember[memberId];

  if (!mentorId) {
    return undefined;
  }

  const mentor = createdMentors.find((item) => item.id === mentorId);

  if (!mentor) {
    return undefined;
  }

  return {
    mentorId,
    settings: getMentorSettings(mentor) as MentorRegistrationFormValues,
  };
};
