import type { Meta, StoryObj } from '@storybook/react';

import Button from '@/shared/ui/button';

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
        defaultValue: false,
      },
    },
    color: {
      control: {
        options: ['primary', 'secondary'],
        type: 'select',
      },
    },
    size: {
      control: {
        options: ['xsmall', 'small', 'medium', 'large'],
        type: 'select',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: ({ children, ...args }) => {
    return <Button {...args}>{children ?? 'Hello World'}</Button>;
  },
};

export const All = {
  render: () => (
    <div className="flex w-[150px] flex-col gap-50">
      <div className="flex gap-50">
        <Button color="primary" size="xsmall">
          Primary XSmall
        </Button>
        <Button color="secondary" size="xsmall">
          Secondary XSmall
        </Button>
        <Button color="primary" size="xsmall" disabled className="flex-grow-0">
          Disabled XSmall
        </Button>
      </div>
      <div className="flex gap-50">
        <Button color="primary" size="small">
          Primary Small
        </Button>
        <Button color="secondary" size="small">
          Secondary Small
        </Button>
        <Button color="primary" size="small" disabled className="flex-grow-0">
          Disabled Small
        </Button>
      </div>
      <div className="flex gap-50">
        <Button color="primary" size="medium">
          Primary Medium
        </Button>
        <Button color="secondary" size="medium">
          Secondary Medium
        </Button>
        <Button color="primary" size="medium" disabled className="flex-grow-0">
          Disabled Medium
        </Button>
      </div>
      <div className="flex gap-50">
        <Button color="primary" size="large">
          Primary Large
        </Button>
        <Button color="secondary" size="large">
          Secondary Large
        </Button>
        <Button color="primary" size="large" disabled className="flex-grow-0">
          Disabled Large
        </Button>
      </div>
    </div>
  ),
};
