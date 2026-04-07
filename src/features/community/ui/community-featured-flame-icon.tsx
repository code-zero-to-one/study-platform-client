'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const DotLottieReact = dynamic(
  async () => (await import('@lottiefiles/dotlottie-react')).DotLottieReact,
  { ssr: false },
);

interface CommunityFeaturedFlameIconProps {
  className?: string;
}

const FEATURED_FLAME_SEGMENT: [number, number] = [60, 240];
const FEATURED_FLAME_SPEED = 0.92;
const FEATURED_FLAME_SRC = '/lottie/community-featured-fire.lottie';

export default function CommunityFeaturedFlameIcon({
  className,
}: CommunityFeaturedFlameIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-200 w-200 shrink-0 items-center justify-center overflow-hidden',
        className,
      )}
    >
      <DotLottieReact
        autoplay
        loop
        speed={FEATURED_FLAME_SPEED}
        src={FEATURED_FLAME_SRC}
        segment={
          [FEATURED_FLAME_SEGMENT[0], FEATURED_FLAME_SEGMENT[1]] as [
            number,
            number,
          ]
        }
        renderConfig={{ autoResize: true, devicePixelRatio: 2 }}
        style={{ height: '100%', lineHeight: 0, width: '100%' }}
      />
    </span>
  );
}
