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
      options: ['primary', 'secondary', 'outlined'],
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
    asChild: {
      control: 'boolean',
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

export const Outlined: Story = {
  args: {
    children: 'Outlined 버튼',
    color: 'outlined',
    size: 'medium',
  },
};

export const Sizes: Story = {
  args: {
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: '각 size variant를 한 번에 확인할 수 있는 예시입니다.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button {...args} size="xsmall">
        XSmall
      </Button>
      <Button {...args} size="small">
        Small
      </Button>
      <Button {...args} size="medium">
        Medium
      </Button>
      <Button {...args} size="large">
        Large
      </Button>
    </div>
  ),
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

export const AsChildLink: Story = {
  args: {
    asChild: true,
    color: 'primary',
    size: 'medium',
    children: <a href="#as-child-link">링크 형태 버튼 (asChild)</a>,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`asChild`를 사용해 실제 DOM 엘리먼트를 교체하는 예시입니다. Slot을 통해 className과 props가 자식 엘리먼트로 전달됩니다.',
      },
    },
  },
};
