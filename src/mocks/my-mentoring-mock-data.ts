export type MyMentoringMethod = 'ONLINE' | 'OFFLINE' | 'CALL';
export type MyMentoringStatus = 'CONFIRMED' | 'PENDING';

export interface MyMentoringMockItem {
  id: number;
  title: string;
  mentorName: string;
  method: MyMentoringMethod;
  status: MyMentoringStatus;
  mentoringTime?: string;
  requestedAt: string;
  pendingWindow?: string;
  description: string;
}

export const myMentoringMockData: MyMentoringMockItem[] = [
  {
    id: 1,
    title: 'Frontend resume feedback',
    mentorName: 'Mina Kim',
    method: 'ONLINE',
    status: 'CONFIRMED',
    mentoringTime: '2026.02.26 (Thu) 20:00 - 21:00',
    requestedAt: '2026.02.20',
    description:
      'Review your resume and portfolio for your target role and define a clear improvement plan.',
  },
  {
    id: 2,
    title: 'React performance code review',
    mentorName: 'Junho Park',
    method: 'ONLINE',
    status: 'PENDING',
    requestedAt: '2026.02.21',
    pendingWindow: '2026.03.01 ~ 2026.03.03 evening',
    description:
      'Your session time is being coordinated with the mentor and will be confirmed by notification.',
  },
  {
    id: 3,
    title: 'Backend interview mock Q&A',
    mentorName: 'Seoyeon Lee',
    method: 'CALL',
    status: 'CONFIRMED',
    mentoringTime: '2026.03.02 (Mon) 19:30 - 20:30',
    requestedAt: '2026.02.19',
    description:
      'Simulate interview questions and get focused feedback for stronger technical communication.',
  },
  {
    id: 4,
    title: 'Career transition roadmap mentoring',
    mentorName: 'Hyunwoo Jung',
    method: 'OFFLINE',
    status: 'PENDING',
    requestedAt: '2026.02.18',
    pendingWindow: 'First week of March weekend',
    description:
      'Meeting place and time are still under discussion and will appear once they are confirmed.',
  },
];

export const getMyMentoringById = (id: number) => {
  return myMentoringMockData.find((item) => item.id === id);
};
