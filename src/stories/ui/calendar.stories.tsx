import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import Calendar from '@/widgets/home/calendar';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1';

// TODO:  추후에 API mocking 적용 할지 확인
const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: [
        http.get(API_URL + '/study/daily/month', () => {
          return HttpResponse.json({ data: 'okay' });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// --- Stories ---

export const Default: Story = {};
