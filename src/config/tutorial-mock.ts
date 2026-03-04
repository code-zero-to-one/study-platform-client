import type { DailyStudyDetail } from '@/types/api/interview.types';

export const TUTORIAL_DAILY_STUDY_MOCK: DailyStudyDetail = {
  dailyStudyId: 9999,
  interviewerId: 1001,
  interviewerName: '면접관',
  interviewerRealName: '면접관',
  interviewerImage: '',
  intervieweeId: 1002,
  intervieweeName: '지원자',
  intervieweeRealName: '지원자',
  intervieweeImage: '',
  partnerTel: '010-0000-0000',
  studySpaceId: 3,
  progressStatus: 'IN_PROGRESS',
  subject: '네트워크 기초',
  description: '튜토리얼용 데이터',
  link: 'https://example.com',
  feedback: '좋은 답변이었습니다.',
};
