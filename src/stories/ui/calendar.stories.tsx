import type { Meta, StoryObj } from '@storybook/react';
import Calendar from '@/widgets/home/calendar/index';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  tags: ['autodocs'],
  args: {
    mode: 'single',
    selected: new Date(),
  },
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

export const WithCompletedDays: Story = {
  args: {
    completedDays: [
      new Date(2025, 5, 4),
      new Date(2025, 5, 5),
      new Date(2025, 5, 27),
      new Date(2025, 5, 28),
    ],
  },
};

export const WithCountsOnly: Story = {
  args: {
    monthlyCompletedCount: 5,
    totalCompletedCount: 20,
  },
};

export const WithCompletedDaysAndCounts: Story = {
  args: {
    completedDays: [
      new Date(2025, 3, 4),
      new Date(2025, 3, 5),
      new Date(2025, 3, 27),
      new Date(2025, 3, 28),
    ],
    monthlyCompletedCount: 4,
    totalCompletedCount: 25,
  },
};
