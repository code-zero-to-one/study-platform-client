import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/shared/shadcn/ui/button';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => {
    return <Button>Hello World</Button>;
  },
};

export const Destructive: Story = {
  render: () => {
    return <Button variant="destructive">Hello World</Button>;
  },
};

export const Outline: Story = {
  render: () => {
    return <Button variant="outline">Hello World</Button>;
  },
};

export const Secondary = {
  render: () => {
    return <Button variant="secondary">Hello World</Button>;
  },
};

export const Ghost = {
  render: () => {
    return <Button variant="ghost">Hello World</Button>;
  },
};

export const Link = {
  render: () => {
    return <Button variant="link">Hello World</Button>;
  },
};
