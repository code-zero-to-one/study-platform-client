import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TableList from '@/shared/ui/table';

const meta = {
  title: 'UI/Table',
  tags: ['autodocs'],
  component: TableList,
  argTypes: {
    data: {
      control: 'object',
      description: `Table Data 아이템 (keys: header, value: Component)`,
    },
  },
  args: {
    data: [
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
    ],
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TableList>;

export default meta;
type Story = StoryObj<typeof TableList>;

// --- Stories ---

export const Default: Story = {};
