import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TableList from '@/shared/ui/table-list';

const meta = {
  title: 'UI/TableList',
  tags: ['autodocs'],
  component: TableList,
  argTypes: {
    data: {
      control: 'object',
      description: `Table Data 아이템 (keys: header, value: Component)`,
    },
  },
  args: {
    headers: ['name', 'email', 'phone'],
    data: [
      {
        name: '김철수',
        email: 'john.doe@example.com',
        phone: '1234567890',
      },
      {
        name: '김영희',
        email: 'jane.doe@example.com',
        phone: '1234567890',
      },
      {
        name: '최철수',
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
