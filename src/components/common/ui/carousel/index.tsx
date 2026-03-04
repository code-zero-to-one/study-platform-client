'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  Carousel as ShadCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/common/ui/(shadcn)/ui/carousel';

function CarouselRoot({
  className,
  ...props
}: React.ComponentProps<typeof ShadCarousel>) {
  return <ShadCarousel className={cn('relative', className)} {...props} />;
}

function CarouselViewport({
  className,
  ...props
}: React.ComponentProps<typeof CarouselContent>) {
  return <CarouselContent {...props} />;
}

function CarouselSlide({
  className,
  ...props
}: React.ComponentProps<typeof CarouselItem>) {
  return (
    <CarouselItem
      className={cn('overflow-hidden rounded-xl', className)}
      {...props}
    />
  );
}

function CarouselButtonPrevious({
  className,
  icon,
  ...props
}: {
  icon?: React.ReactNode;
} & React.ComponentProps<typeof CarouselPrevious>) {
  return (
    <CarouselPrevious
      icon={icon}
      className={cn(
        'border-border-default bg-fill-neutral-subtle-default top-1/2 -left-200 -translate-y-1/2 cursor-pointer border p-100',
        className,
      )}
      {...props}
    />
  );
}

function CarouselButtonNext({
  className,
  icon,
  ...props
}: {
  icon?: React.ReactNode;
} & React.ComponentProps<typeof CarouselNext>) {
  return (
    <CarouselNext
      icon={icon}
      className={cn(
        'border-border-default bg-fill-neutral-subtle-default top-1/2 -right-200 -translate-y-1/2 cursor-pointer border p-100',
        className,
      )}
      {...props}
    />
  );
}

export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Slide: CarouselSlide,
  Prev: CarouselButtonPrevious,
  Next: CarouselButtonNext,
} as const;
