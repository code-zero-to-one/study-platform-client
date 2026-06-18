import type { Meta, StoryObj } from '@storybook/react';
import Calendar from '@/components/one-to-one/calendars/home-calendar';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '335px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {};
