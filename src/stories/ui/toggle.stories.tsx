import type { Meta, StoryObj } from '@storybook/react';
import { useState, ComponentProps } from 'react';
import { ToggleSwitch } from '@/shared/ui/toggle/switch';

type ToggleSwitchProviderProps = ComponentProps<typeof ToggleSwitch.Provider>;

const meta: Meta<typeof ToggleSwitch.Provider> = {
  component: ToggleSwitch.Provider,
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

type Story = StoryObj<typeof ToggleSwitch.Provider>;

const ToggleWithState = (args: ToggleSwitchProviderProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <ToggleSwitch.Provider
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
