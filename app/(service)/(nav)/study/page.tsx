import { useInfiniteQuery } from '@tanstack/react-query';
import StudyCard, {
  GroupStudy,
} from '@/features/study/group/ui/group-study-list';
import { getGroupStudyList } from '@/features/study/group/api/get-group-study-list';
import IconPlus from '@/shared/icons/plus.svg';
import Button from '@/shared/ui/button';
import Sidebar from '@/widgets/home/sidebar';
import GroupStudyList from '@/features/study/group/ui/group-study-list';

const groupStudies: GroupStudy[] = [
  {
    basicInfo: {
      groupStudyId: 1,
      type: 'frontend',
      targetRole: 'junior',
      maxMembers: 5,
      experienceLevel: 'beginner',
      method: 'online',
      regularMeeting: '매주 화요일 8PM',
      startDate: '2025-10-01',
      durationWeeks: 6,
      price: 50000,
      status: 'recruiting',
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-25T12:30:00Z',
    },
    simpleDetailInfo: {
      title: 'React 입문 스터디',
      summary: '기초부터 React를 배워보는 주니어 대상 스터디',
    },
  },
  {
    basicInfo: {
      groupStudyId: 2,
      type: 'backend',
      targetRole: 'senior',
      maxMembers: 8,
      experienceLevel: 'intermediate',
      method: 'offline',
      regularMeeting: '매주 토요일 2PM',
      startDate: '2025-11-05',
      durationWeeks: 8,
      price: 100000,
      status: 'planned',
      createdAt: '2025-09-22T09:00:00Z',
      updatedAt: '2025-09-26T11:00:00Z',
    },
    simpleDetailInfo: {
      title: 'Spring Boot 중급 스터디',
      summary: '실무 중심으로 스프링부트를 다뤄보는 스터디',
    },
  },
  {
    basicInfo: {
      groupStudyId: 3,
      type: 'fullstack',
      targetRole: 'all',
      maxMembers: 10,
      experienceLevel: 'beginner',
      method: 'hybrid',
      regularMeeting: '격주 일요일 3PM',
      startDate: '2025-12-01',
      durationWeeks: 10,
      price: 0,
      status: 'recruiting',
      createdAt: '2025-09-23T14:20:00Z',
      updatedAt: '2025-09-27T15:40:00Z',
    },
    simpleDetailInfo: {
      title: '풀스택 웹 프로젝트 스터디',
      summary: 'React + Node.js로 팀 프로젝트 경험 쌓기',
    },
  },
  {
    basicInfo: {
      groupStudyId: 4,
      type: 'ai',
      targetRole: 'researcher',
      maxMembers: 6,
      experienceLevel: 'advanced',
      method: 'online',
      regularMeeting: '매주 수요일 9PM',
      startDate: '2025-10-15',
      durationWeeks: 12,
      price: 200000,
      status: 'in-progress',
      createdAt: '2025-09-24T08:00:00Z',
      updatedAt: '2025-09-28T09:30:00Z',
    },
    simpleDetailInfo: {
      title: '딥러닝 논문 스터디',
      summary: '최신 AI 논문 리뷰와 구현을 목표로 하는 스터디',
    },
  },
  {
    basicInfo: {
      groupStudyId: 5,
      type: 'mobile',
      targetRole: 'junior',
      maxMembers: 4,
      experienceLevel: 'beginner',
      method: 'offline',
      regularMeeting: '매주 금요일 7PM',
      startDate: '2025-11-20',
      durationWeeks: 5,
      price: 30000,
      status: 'recruiting',
      createdAt: '2025-09-25T10:45:00Z',
      updatedAt: '2025-09-27T18:00:00Z',
    },
    simpleDetailInfo: {
      title: 'Flutter 앱 개발 기초',
      summary: 'Flutter로 간단한 앱을 함께 만들어보는 스터디',
    },
  },
];

export default function Study() {
  return (
    <div className="flex w-full gap-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="flex justify-between">
          <span className="font-designer-28b text-[#181D27]">
            스터디 둘러보기
          </span>
          <Button
            color="primary"
            size="large"
            iconPosition="left"
            icon={<IconPlus />}
          >
            스터디 개설하기
          </Button>
        </div>
        <GroupStudyList />
      </div>
      <Sidebar />
    </div>
  );
}
