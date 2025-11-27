// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FiPlus, FiArrowRight } from 'react-icons/fi';
import Button from '.';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['xsmall', 'small', 'medium', 'large'],
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    icon: {
      control: false,
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary 버튼',
    color: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary 버튼',
    color: 'secondary',
    size: 'medium',
  },
};

export const Sizes: Story = {
  args: {
    children: '사이즈 예시',
    color: 'primary',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: '각 size variant를 확인하기 위한 예시입니다.',
      },
    },
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: '아이콘 (왼쪽)',
    color: 'primary',
    size: 'medium',
    icon: <FiPlus />,
    iconPosition: 'left',
  },
};

export const WithRightIcon: Story = {
  args: {
    children: '아이콘 (오른쪽)',
    color: 'primary',
    size: 'medium',
    icon: <FiArrowRight />,
    iconPosition: 'right',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화 버튼',
    color: 'primary',
    size: 'medium',
    disabled: true,
  },
};
