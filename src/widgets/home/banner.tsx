'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import { Carousel } from '@/components/ui/carousel';
import ArrowBackIcon from 'public/icons/arrow_back_ios.svg';
import ArrowForwardIcon from 'public/icons/arrow_forward_ios.svg';

const bannerImages = [
  '/images/banner.png',
  '/images/banner.png',
  '/images/banner.png',
];

export default function BannerCarousel() {
  const handleBannerClick = (index: number) => {
    sendGTMEvent({
      event: 'banner_click',
      banner_index: index + 1,
      banner_total: bannerImages.length,
    });
  };

  const handleBannerNavigation = (direction: 'prev' | 'next') => {
    sendGTMEvent({
      event: 'banner_navigation',
      direction,
      location: 'home',
    });
  };

  return (
    <Carousel.Root className="rounded-150 border-border-subtlest border">
      <Carousel.Viewport>
        {bannerImages.map((src, i) => (
          <Carousel.Slide key={i}>
            <button
              onClick={() => handleBannerClick(i)}
              className="bg-background-alternative relative h-[160px] w-full"
            >
              <Image
                src={src}
                alt={`배너 ${i + 1}`}
                fill
                priority
                className="object-contain"
              />
            </button>
          </Carousel.Slide>
        ))}
      </Carousel.Viewport>
      <Carousel.Prev
        icon={<ArrowBackIcon />}
        onClick={() => handleBannerNavigation('prev')}
      />
      <Carousel.Next
        icon={<ArrowForwardIcon />}
        onClick={() => handleBannerNavigation('next')}
      />
    </Carousel.Root>
  );
}
