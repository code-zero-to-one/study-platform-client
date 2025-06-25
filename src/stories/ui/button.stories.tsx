import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import Button from '@/shared/ui/button';

const meta = {
  title: 'UI/Button',
  tags: ['autodocs'],
  component: Button,
  argTypes: {
    children: {
      description: 'Button 레이블',
      control: {
        type: 'text',
      },
    },
    asChild: {
      control: 'boolean',
      description:
        'Children 으로 전달된 HTML 요소로 해당 컴포넌트를 렌더링할지의 여부를 결정합니다.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'Button 활성화 유무',
      type: 'boolean',
      control: {
        type: 'boolean',
        defaultValue: false,
      },
    },
    color: {
      description: 'Button 컴포넌트 색',
      control: {
        type: 'select',
      },
      options: ['primary', 'secondary'],
    },
    size: {
      description: 'Button 컴포넌트 크기',
      control: {
        type: 'select',
      },
      options: ['xsmall', 'small', 'medium', 'large'],
    },
  },
  decorators: [
    (Story, context) => {
      if (context.args.asChild && typeof context.args.children === 'string') {
        return (
          <Story
            args={{
              ...context.args,
              children: <p>{context.args.children}</p>,
            }}
          />
        );
      }

      return <Story />;
    },
  ],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// --- Stories ---

export const Default: Story = {
  args: {
    disabled: false,
    children: '버튼 레이블',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '버튼 레이블',
  },
};
export const Small: Story = {
  args: {
    size: 'small',
    disabled: false,
    children: '버튼 레이블',
  },
};
export const XSmall: Story = {
  args: {
    size: 'xsmall',
    disabled: false,
    children: '버튼 레이블',
  },
};
export const Medium: Story = {
  args: {
    size: 'medium',
    disabled: false,
    children: '버튼 레이블',
  },
};
export const Large: Story = {
  args: {
    size: 'large',
    disabled: false,
    children: '버튼 레이블',
  },
};
