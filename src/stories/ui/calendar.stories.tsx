import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Calendar from '@/widgets/home/calendar';

// TODO: 현재는 문제 없는 것 같지만 추후에 API mocking 적용 할지 확인
const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// --- Stories ---

export const Default: Story = {};
