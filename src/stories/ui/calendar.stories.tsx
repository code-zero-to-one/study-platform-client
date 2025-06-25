import type { Meta, StoryObj } from '@storybook/nextjs-vite';
// import { http, HttpResponse } from 'msw';
import Calendar from '@/widgets/home/calendar';

// const calendarMockData = {};

//TODO: API request Mocking

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  // parameters: {
  //   layout: 'centered',
  //   msw: {
  //     handlers: [
  //       http.get(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/study/daily/month`,
  //         () => {
  //           return HttpResponse.json(calendarMockData);
  //         },
  //       ),
  //     ],
  //   },
  // },
  // decorators: [
  //   (Story) => {
  //     return (
  //       <div style={{ width: '335px' }}>
  //         <Story />
  //       </div>
  //     );
  //   },
  // ],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// --- Stories ---

export const Default: Story = {};
