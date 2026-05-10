'use client';

import { motion, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const CHAR_HEIGHT = 223;

export function BenefitScrollCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardYOffsets, setCardYOffsets] = useState<number[]>([]);

  const springY = useSpring(0, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const cards = Array.from(parent.children).filter(
      (el) => el !== container,
    ) as HTMLElement[];
    cardsRef.current = cards;

    const computeOffsets = () =>
      cards.map((card) => card.offsetTop + card.offsetHeight - CHAR_HEIGHT);

    const updateOffsets = () => setCardYOffsets(computeOffsets());
    updateOffsets();

    const ro = new ResizeObserver(updateOffsets);
    cards.forEach((card) => ro.observe(card));

    const handleScroll = () => {
      const viewportMid = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Infinity;

      cardsRef.current.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - viewportMid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      setActiveIndex(bestIdx);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const y = cardYOffsets[activeIndex];
    if (y !== undefined) springY.set(y);
  }, [activeIndex, cardYOffsets, springY]);

  useEffect(() => {
    cardsRef.current.forEach((card, i) => {
      card.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
      card.style.opacity = i === activeIndex ? '1' : '0.55';
      card.style.transform = i === activeIndex ? 'scale(1)' : 'scale(0.97)';
    });
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 hidden pointer-events-none lg:block"
    >
      <motion.div
        style={{ y: springY }}
        className="absolute right-0 top-0 pointer-events-none"
      >
        {/* Left outer shadow */}
        <div
          className="absolute"
          style={{ left: 50, top: 192, width: 90, height: 9 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-81.11%',
              bottom: '-81.11%',
              left: '-8.11%',
              right: '-8.11%',
            }}
          >
            <Image
              alt=""
              fill
              unoptimized
              src="/class/detail/shadow-outer.svg"
            />
          </div>
        </div>
        {/* Left inner shadow */}
        <div
          className="absolute"
          style={{ left: 67, top: 192, width: 56, height: 9 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-161.11%',
              bottom: '-161.11%',
              left: '-25.89%',
              right: '-25.89%',
            }}
          >
            <Image
              alt=""
              fill
              unoptimized
              src="/class/detail/shadow-inner.svg"
            />
          </div>
        </div>
        {/* Right outer shadow */}
        <div
          className="absolute"
          style={{ left: 158, top: 192, width: 90, height: 9 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-81.11%',
              bottom: '-81.11%',
              left: '-8.11%',
              right: '-8.11%',
            }}
          >
            <Image
              alt=""
              fill
              unoptimized
              src="/class/detail/shadow-outer.svg"
            />
          </div>
        </div>
        {/* Right inner shadow */}
        <div
          className="absolute"
          style={{ left: 175, top: 192, width: 56, height: 9 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-161.11%',
              bottom: '-161.11%',
              left: '-25.89%',
              right: '-25.89%',
            }}
          >
            <Image
              alt=""
              fill
              unoptimized
              src="/class/detail/shadow-inner.svg"
            />
          </div>
        </div>
        <Image
          src="/class/detail/character-cats.png"
          alt=""
          width={298}
          height={223}
          priority={false}
        />
      </motion.div>
    </div>
  );
}
