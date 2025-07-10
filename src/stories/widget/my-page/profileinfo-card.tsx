import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfileInfoCard from '@/widgets/my-page/profileinfo-card';

const meta = {
  title: 'Widget/MyPage/Profile Info Card',
  tags: ['autodocs'],
  component: ProfileInfoCard,
  args: {
    title: 'Example Title',
    content: 'Example Contents',
  },
} satisfies Meta<typeof ProfileInfoCard>;

export default meta;

type Story = StoryObj<typeof ProfileInfoCard>;

export const Default: Story = {};
