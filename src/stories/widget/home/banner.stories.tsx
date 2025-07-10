import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BannerCarousel from '@/widgets/home/banner';

const meta = {
  title: 'Widget/Home/Banner Carousel',
  component: BannerCarousel,
} satisfies Meta<typeof BannerCarousel>;

export default meta;

type Story = StoryObj<typeof BannerCarousel>;

export const Default: Story = {};
