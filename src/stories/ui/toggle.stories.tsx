import type { Meta, StoryObj } from '@storybook/react';
import { useState, ComponentProps } from 'react';
import { ToggleSwitch } from '@/components/ui/toggle/switch';

type ToggleSwitchProviderProps = ComponentProps<typeof ToggleSwitch.Root>;

const meta: Meta<typeof ToggleSwitch.Root> = {
  component: ToggleSwitch.Root,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'gray'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof ToggleSwitch.Root>;

const ToggleWithState = (args: ToggleSwitchProviderProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <ToggleSwitch.Root
      {...args}
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
};

export const Default: Story = {
  render: ToggleWithState,
  args: {},
};
