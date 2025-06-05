'use client';

import { cn } from '@/shared/shadcn/lib/utils';
import {
  Carousel as ShadCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/shadcn/ui/carousel';

function CarouselProvider({
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
<<<<<<< Updated upstream
   return (
      <CarouselPrevious
         variant='default'
         icon={icon}
         className={cn('top-1/2 -left-200 -translate-y-1/2 border border-border-default bg-fill-neutral-subtle-default p-100 cursor-pointer', className)}
         {...props}
      />
   );
=======
  return (
    <CarouselPrevious
      variant="default"
      icon={icon}
      className={cn(
        'border-border-default bg-fill-neutral-subtle-default top-1/2 -left-200 -translate-y-1/2 border p-100',
        className,
      )}
      {...props}
    />
  );
>>>>>>> Stashed changes
}

function CarouselButtonNext({
  className,
  icon,
  ...props
}: {
  icon?: React.ReactNode;
} & React.ComponentProps<typeof CarouselNext>) {
<<<<<<< Updated upstream
   return (
      <CarouselNext
         variant='default'
         icon={icon}
         className={cn('top-1/2 -right-200 -translate-y-1/2 border border-border-default bg-fill-neutral-subtle-default p-100 cursor-pointer', className)}
         {...props}
      />
   );
=======
  return (
    <CarouselNext
      variant="default"
      icon={icon}
      className={cn(
        'border-border-default bg-fill-neutral-subtle-default top-1/2 -right-200 -translate-y-1/2 border p-100',
        className,
      )}
      {...props}
    />
  );
>>>>>>> Stashed changes
}

export const Carousel = {
  Provider: CarouselProvider,
  Viewport: CarouselViewport,
  Slide: CarouselSlide,
  Prev: CarouselButtonPrevious,
  Next: CarouselButtonNext,
} as const;
