import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MyStudyCard from '@/widgets/my-study/my-study-card';

// Login -> Mypage 이후 우측 사이드바 메뉴
const meta = {
  title: 'Widget/MyStudy/MyStudyCard',
  component: MyStudyCard,
  args: {
    title: 'Title',
    value: 'Value',
    unit: '단위',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MyStudyCard>;

export default meta;

type Story = StoryObj<typeof MyStudyCard>;

// 내활동, 성장지표부분

export const Streak: Story = {
  args: {
    title: '연속 참여',
    value: 8,
    unit: '주',
  },
};
