'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { BenefitCardData } from './class-detail-benefits-data';

interface Props {
  card: BenefitCardData;
  /** When animating, dims/scales non-active cards. Always true for the static fallback. */
  isActive: boolean;
  /** Scrub mode: accordion-expand the active card's body. Off = static expanded card. */
  animate: boolean;
}

export function BenefitCard({ card, isActive, animate }: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-200 p-350 transition-[opacity,transform] duration-[400ms] ease-out',
        card.bg,
        isActive ? 'opacity-100 scale-100' : 'opacity-[0.55] scale-[0.97]',
      )}
    >
      <p className="font-designer-20b text-gray-800">{card.title}</p>
      {animate ? (
        <LazyMotion features={domAnimation}>
          <AnimatePresence initial={false}>
            {isActive && (
              <m.div
                key="body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                {card.body}
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>
      ) : (
        card.body
      )}
    </div>
  );
}
