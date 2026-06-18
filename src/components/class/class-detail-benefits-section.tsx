'use client';

import {
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import { useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { clamp } from '@/lib/math';
import { BenefitCard } from './benefit-card';
import { BenefitScrollCharacter } from './benefit-scroll-character';
import { BENEFIT_CARDS } from './class-detail-benefits-data';

// Scroll-track height in viewport units. Sticky inner pins for (SECTION_VH - 100)vh
// of travel, mapped to scrollYProgress 0..1 driving the 4-card accordion + character.
const SECTION_VH = 400;

const HEADING = (
  <h2 className="font-designer-24b text-gray-800">
    ZERO-ONE에서 드리는 입문자 코스 혜택!
  </h2>
);

export function ClassDetailBenefitsSection() {
  const trackRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(
      clamp(
        Math.round(v * (BENEFIT_CARDS.length - 1)),
        0,
        BENEFIT_CARDS.length - 1,
      ),
    );
  });

  // Reduced-motion / mobile fallback: static fully-expanded stack, no pin/scrub.
  // Mobile has no character + would otherwise scroll an empty 400vh track.
  if (reducedMotion || !isDesktop) {
    return (
      <section id="benefits">
        {HEADING}
        <div className="mt-400 flex flex-col gap-250">
          {BENEFIT_CARDS.map((card) => (
            <BenefitCard
              key={card.title}
              card={card}
              isActive
              animate={false}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="benefits"
      ref={trackRef}
      className="relative"
      style={{ height: `${SECTION_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {HEADING}
        <div className="relative mt-400 flex flex-col gap-250">
          {BENEFIT_CARDS.map((card, i) => (
            <BenefitCard
              key={card.title}
              card={card}
              isActive={i === active}
              animate
            />
          ))}

          <BenefitScrollCharacter progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
