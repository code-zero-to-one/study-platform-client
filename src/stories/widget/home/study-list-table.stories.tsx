import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import StudyListSection from '@/widgets/home/study-list-table';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1';

const mockSuccess = {
  statusCode: 200,
  timestamp: '2025-05-15T10:30:00.000',
  content: {
    dailyStudyResponses: [
      {
        interviewer: '김민준',
        interviewerImage: 'https://example.com/images/minjun.jpg',
        interviewee: '이서연',
        intervieweeImage: 'https://example.com/images/seoyeon.jpg',
        dailyStudyId: 2,
        subject: '알고리즘 문제 풀이',
        feedback:
          '시간 복잡도 계산이 약간 미흡했지만, 전반적인 문제 해결 능력은 훌륭합니다.',
        progressStatus: 'COMPLETE',
        link: 'https://github.com/study-group/algo-2',
      },
      {
        interviewer: '박서준',
        interviewerImage: 'https://example.com/images/seojun.jpg',
        interviewee: '최유나',
        intervieweeImage: 'https://example.com/images/yuna.jpg',
        dailyStudyId: 1,
        subject: '데이터베이스 설계',
        feedback: '아직 피드백이 존재하지 않습니다.',
        progressStatus: 'PENDING',
        link: 'https://github.com/study-group/db-design-1',
      },
    ],
  },
  message: 'OK',
};

//msw
const meta = {
  title: 'Widget/Home/Study List Section',
  component: StudyListSection,
  args: {
    date: new Date(),
  },
} satisfies Meta<typeof StudyListSection>;

export default meta;

type Story = StoryObj<typeof StudyListSection>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(API_URL + `/study/daily`, async () => {
          return HttpResponse.json(mockSuccess);
        }),
      ],
    },
  },
};
