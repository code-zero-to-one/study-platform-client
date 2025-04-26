import type { Meta, StoryObj } from '@storybook/react'
import Calendar from '@/shared/ui/calendar'

const meta: Meta<typeof Calendar> = {
   title: 'UI/Calendar',
   component: Calendar,
   tags: ['autodocs'], // optional: 자동 문서 생성용
   args: {
      mode: 'single',
      selected: new Date(),
      highlightToday: true,
   },
}

export default meta

type Story = StoryObj<typeof Calendar>

export const Default: Story = {}

export const WithoutHighlightToday: Story = {
   args: {
      highlightToday: false,
   },
}

export const RangeMode: Story = {
   args: {
      mode: 'range',
      selected: {
         from: new Date(2024, 3, 1),
         to: new Date(2024, 3, 10),
      },
   },
}
