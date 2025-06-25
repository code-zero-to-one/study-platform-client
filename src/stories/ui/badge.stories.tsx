import { Meta, StoryObj } from '@storybook/nextjs-vite';
import Badge from '@/shared/ui/badge/index';
const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      description: 'Badge 의 색을 결정합니다',
      control: { type: 'select' },
      options: ['default', 'completed', 'incomplete'],
    },
    shape: {
      description: 'Badge 의 모양을 결정합니다',
      control: { type: 'select' },
      options: ['rectangle', 'round'],
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
    children: {
      control: { type: 'text' },
      description: `Badge 의 자식 요소를 전달합니다. \n asChild 가 true 일 경우, 반드시 하나의 자식 요소만을 전달해야합니다`,
    },
  },
  decorators: [
    (Story, context) => {
      if (context.args.asChild && typeof context.args.children === 'string') {
        return (
          <Story
            args={{
              ...context.args,
              children: <button>{context.args.children}</button>,
            }}
          />
        );
      }

      return <Story />;
    },
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Default: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'default',
    shape: 'rectangle',
  },
};

export const Completed: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'completed',
    shape: 'rectangle',
  },
};

export const Incomplete: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'incomplete',
    shape: 'rectangle',
  },
};

export const Rectangle: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'default',
    shape: 'rectangle',
  },
};

export const Round: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'default',
    shape: 'round',
  },
};
