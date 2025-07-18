import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ToggleSwitch } from '@/shared/ui/toggle/switch';

// TODO: docs 상태에서 switch 적용되도록
const meta = {
  title: 'UI/Toggle Switch',
  component: ToggleSwitch.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      description: 'Toggle ON/OFF 유무',
      control: 'boolean',
    },
    color: {
      description: 'Toggle 백그라운드 색 변경',
      control: 'select',
      options: ['primary', 'gray'],
    },
    size: {
      description: 'Toggle 크기 변경',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      description: 'Toggle 비활성화 유무',
      control: 'boolean',
    },
  },
  args: {
    color: 'primary',
    size: 'md',
    checked: false,
    disabled: false,
  },
} satisfies Meta<typeof ToggleSwitch.Root>;
export default meta;

type Story = StoryObj<typeof ToggleSwitch.Root>;

// --- Stories ---

export const Default: Story = {
  args: {},
};

export const ToggleOn: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Gray: Story = {
  args: {
    color: 'gray',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};
export const Medium: Story = {
  args: {
    size: 'md',
  },
};
export const Large: Story = {
  args: {
    size: 'lg',
  },
};
