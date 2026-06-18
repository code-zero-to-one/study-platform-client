// UserAvatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Avatar from '.';

const meta: Meta<typeof Avatar> = {
  //   title: 'Entities/User/UserAvatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    alt: 'user-profile',
    size: 32,
  },
  argTypes: {
    image: {
      control: 'text',
      description:
        '이미지 URL. 빈 문자열이거나 로드에 실패하면 fallbackSrc가 노출됩니다.',
    },
    fallbackSrc: {
      control: 'text',
      description:
        '이미지 로드 실패 시 표시할 fallback 이미지 경로. 기본값: /profile-default.svg',
    },
    size: {
      control: { type: 'number', min: 16, max: 128, step: 4 },
      description: '아바타의 가로/세로 크기(px)',
    },
    alt: {
      control: 'text',
      description: '이미지 대체 텍스트',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    image: 'https://avatars.githubusercontent.com/u/9919?v=4', // 예시 URL
  },
};

export const ErrorFallback: Story = {
  args: {
    image: 'https://example.com/this-image-does-not-exist.png', // onError → 기본 아이콘
  },
};

export const CustomSize: Story = {
  args: {
    size: 48,
  },
};
