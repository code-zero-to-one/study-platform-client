import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import { MemberInfoResponse } from '@/features/auth/model/types';
import Header from '@/widgets/home/header';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1';

const mockSuccess: MemberInfoResponse = {
  isLogin: true,
  content: {
    memberProfile: {
      memberName: '박경',
      profileImage: {
        resizedImages: [
          {
            resizedImageUrl:
              'https://test-api.zeroone.it.kr/profile-image/anyujin.jpg',
          },
        ],
      },
    },
  },
  statusCode: 200,
  message: '',
};

const meta = {
  title: 'Widget/Home/Header',
  component: Header,
  render: Header,
  argTypes: {
    image: {
      control: false,
      description: 'UserAvatar Image URL',
    },
  },
  decorators: [
    (Story, context) => {
      if (context.name === 'Login') {
        document.cookie = 'memberId=1;';
      }

      return <Story key={context.id} />;
    },
  ],
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof Header>;

export const Logout: Story = {
  parameters: {
    id: 'logout',
    docs: { disable: true },
    msw: {
      handlers: [
        http.get(API_URL + `/members/:id/profile`, async () => {
          return new HttpResponse(null, { status: 403 });
        }),
      ],
    },
  },
  args: {
    key: 'logout',
  },
};

export const Login: Story = {
  parameters: {
    id: 'login',
    docs: { disable: true },
    msw: {
      handlers: [
        http.get(API_URL + `/members/:id/profile`, () => {
          return HttpResponse.json(mockSuccess);
        }),
      ],
    },
  },
  args: {
    key: 'login',
  },
};
