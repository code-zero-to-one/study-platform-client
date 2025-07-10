import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TodoList from '@/widgets/home/todo-list';

const meta = {
  title: 'Widget/Home/Todo List',
  component: TodoList,
  args: {
    statusList: [false, false, false],
  },
} satisfies Meta<typeof TodoList>;

export default meta;

type Story = StoryObj<typeof TodoList>;

export const Default: Story = {
  args: {
    statusList: [false, false, false],
  },
};

export const InProress: Story = {
  args: {
    statusList: [true, true, false],
  },
};

export const AllChecked: Story = {
  args: {
    statusList: [true, true, true],
  },
};
