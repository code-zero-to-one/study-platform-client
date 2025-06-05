import type { Meta, StoryObj } from '@storybook/react';

import TableList from '@/shared/ui/table';

const meta: Meta<typeof TableList> = {
  component: TableList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof TableList>;

export const Default: Story = {
  render: () => {
    return (
      <TableList
        headers={['name', 'email', 'phone']}
        data={[
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
          },
          {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            phone: '1234567890',
          },
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
          },
        ]}
      />
    );
  },
};
