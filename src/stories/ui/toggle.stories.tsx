<<<<<<< Updated upstream
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ToggleSwitch } from '@/shared/ui/toggle/switch'
=======
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from '@/shared/ui/toggle';
>>>>>>> Stashed changes

const meta: Meta<typeof ToggleSwitch.Provider> = {
  component: ToggleSwitch.Provider,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'gray'], // 기존 예시 기준 수정
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

<<<<<<< Updated upstream
type Story = StoryObj<typeof ToggleSwitch.Provider>
=======
type Story = StoryObj<typeof Toggle.Provider>;
>>>>>>> Stashed changes

const ToggleWithState = (args: any) => {
  const [checked, setChecked] = useState(false);

  return (
<<<<<<< Updated upstream
    <ToggleSwitch.Provider
      {...args}
      checked={checked}
      onCheckedChange={setChecked}
    />
  )
}
=======
    <Toggle.Provider {...args} checked={checked} onCheckedChange={setChecked} />
  );
};
>>>>>>> Stashed changes

export const Default: Story = {
  render: ToggleWithState,
  args: {},
};
