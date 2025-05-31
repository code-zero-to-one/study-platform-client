import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ToggleSwitch } from '@/shared/ui/toggle/switch'

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
}
export default meta

type Story = StoryObj<typeof ToggleSwitch.Provider>

const ToggleWithState = (args: any) => {
  const [checked, setChecked] = useState(false)

  return (
    <ToggleSwitch.Provider
      {...args}
      checked={checked}
      onCheckedChange={setChecked}
    />
  )
}

export const Default: Story = {
  render: ToggleWithState,
  args: {},
}
