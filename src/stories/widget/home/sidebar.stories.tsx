import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import {
  ISidebarProps,
  SidebarClient as Sidebar,
} from '@/widgets/home/sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1';

// TODO: 추후에 따로 mockResponse 만을 모아 정리
const MOCK_DATA: ISidebarProps = {
  hasTodo: true,
  memberId: 4,
  userProfile: {
    studyApplied: true,
    autoMatching: true,
    memberId: 4,
    memberInfo: {
      availableStudyTimes: [
        {
          fromTime: '09:00',
          fullLabel: '오전(09:00~12:00)',
          id: 1,
          label: '오전',
          toTime: '12:00',
        },
        {
          fromTime: null,
          fullLabel: '시간 협의 가능',
          id: 6,
          label: '시간 협의 가능',
          toTime: null,
        },
      ],
      preferredStudySubject: {
        name: '전체',
        studySubjectId: 'ALL',
      },
      selfIntroduction: '안녕하세요',
      studyPlan: '반갑습니다',
      techStacks: [
        {
          code: 'DB',
          level: 2,
          parentId: 1,
          techStackId: 5,
          techStackName: 'Database',
        },
        {
          code: 'DJA',
          level: 2,
          parentId: 1,
          techStackId: 2,
          techStackName: 'Django',
        },
      ],
    },
    memberProfile: {
      birthDate: null,
      blogOrSnsLink: null,
      githubLink: null,
      hobbies: null,
      interests: [
        {
          id: 6,
          name: '음악',
        },
        {
          id: 7,
          name: '종이접기',
        },
        {
          id: 8,
          name: '영화/드라마',
        },
        {
          id: 9,
          name: '운동/헬스',
        },
      ],
      mbti: null,
      memberName: '조민주',
      profileImage: {
        imageId: 16,
        resizedImages: [
          {
            imageSizeType: {
              height: null,
              imageTypeName: 'ORIGINAL',
              width: null,
            },
            resizedImageId: 16,
            resizedImageUrl:
              'https://test-api.zeroone.it.kr/profile-image/profile-formdata-4',
          },
        ],
      },
      simpleIntroduction: '기본 이미지로 변경했어요',
      tel: '010-1122-2233',
    },
  },
};

// TODO: 각각의 fetch 요청에 mock response 작성
const meta = {
  title: 'Widget/Home/Sidebar',
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.get(API_URL + '/study-subjects', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
        http.get(API_URL + '/tech-stacks', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
        http.get(API_URL + '/available-study-times', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
        http.get(API_URL + '/available-study-times', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
        http.get(API_URL + '/members/4/profile', () => {
          return HttpResponse.json({ message: 'okay' });
        }),
        http.get(API_URL + '/study/daily/month', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
      ],
    },
  },
  component: Sidebar,
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Logout: Story = {
  parameters: {
    id: 'logout',
  },
  argTypes: {
    memberId: {
      control: false,
    },
    userProfile: {
      control: false,
    },
    hasTodo: {
      control: false,
    },
  },
};

export const Login: Story = {
  parameters: {
    id: 'login',
  },
  args: MOCK_DATA,
  argTypes: {
    memberId: {
      control: false,
    },
    hasTodo: {
      control: 'boolean',
    },
  },
};
