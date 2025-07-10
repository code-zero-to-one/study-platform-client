import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Sidebar from '@/widgets/my-page/sidebar';

const meta = {
  title: 'Widget/MyPage/Sidebar',
  component: Sidebar,
  args: {
    title: 'Example Title',
    content: 'Example Contents',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};
