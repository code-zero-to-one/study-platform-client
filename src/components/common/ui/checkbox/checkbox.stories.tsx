// Checkbox.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Checkbox from '.';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    themeColor: {
      control: 'text',
      description:
        'Tailwind token (e.g. fill-success-default-default) or hex color (e.g. #10b981)',
    },
    onToggle: { action: 'toggled' },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    id: 'checkbox-default',
    themeColor: 'fill-success-default-default',
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return (
      <Checkbox
        {...args}
        checked={checked}
        onToggle={() => setChecked((prev) => !prev)}
      />
    );
  },
};

export const WithHexColor: Story = {
  args: {
    id: 'checkbox-hex',
    themeColor: '#10b981', // Tailwind의 emerald 계열과 비슷한 색
  },
  render: (args) => {
    const [checked, setChecked] = useState(true);

    return (
      <Checkbox
        {...args}
        checked={checked}
        onToggle={() => setChecked((prev) => !prev)}
      />
    );
  },
};

export const WithDesignToken: Story = {
  args: {
    id: 'checkbox-token',
    themeColor: 'fill-warning-default-default',
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return (
      <Checkbox
        {...args}
        checked={checked}
        onToggle={() => setChecked((prev) => !prev)}
      />
    );
  },
};
