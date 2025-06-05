'use client';

import Image from 'next/image';
import { Carousel } from '@/shared/ui/carousel';
import ArrowBackIcon from 'public/icons/arrow_back_ios.svg';
import ArrowForwardIcon from 'public/icons/arrow_forward_ios.svg';

const bannerImages = [
  '/images/banner.png',
  '/images/banner.png',
  '/images/banner.png',
];

export default function BannerCarousel() {
  return (
    <Carousel.Provider className="rounded-150 border-border-subtle border">
      <Carousel.Viewport>
        {bannerImages.map((src, i) => (
          <Carousel.Slide key={i}>
            <div className="relative h-[160px] w-full">
              <Image
                src={src}
                alt={`배너 ${i + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </Carousel.Slide>
        ))}
      </Carousel.Viewport>
      <Carousel.Prev icon={<ArrowBackIcon />} />
      <Carousel.Next icon={<ArrowForwardIcon />} />
    </Carousel.Provider>
  );
}
