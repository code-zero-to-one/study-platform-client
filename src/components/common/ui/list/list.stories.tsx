import type { Meta, StoryObj } from '@storybook/react';

import List from '.';

const meta: Meta<typeof List> = {
  component: List,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => {
    return (
      <List className="mx-auto w-[200px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <List.Item key={index}>List Item {index + 1}</List.Item>
        ))}
      </List>
    );
  },
};
