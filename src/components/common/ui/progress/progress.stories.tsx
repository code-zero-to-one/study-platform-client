import type { Meta, StoryObj } from '@storybook/react';

import Progress from '.';

const meta: Meta<typeof Progress> = {
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: '현재 진행률을 나타내는 숫자 값입니다. (0에서 100 사이)',
      control: 'number',
    },
    indicatorColor: {
      description: '진행 바의 색상을 지정하는 문자열입니다.',
      control: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 50,
    indicatorColor: 'bg-blue-500',
  },
};
