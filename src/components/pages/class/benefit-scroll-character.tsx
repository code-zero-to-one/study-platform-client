'use client';

import { motion, useReducedMotion, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const CHAR_TOP_OFFSET = 38;

interface Props {
  activeIndex: number;
}

export function BenefitScrollCharacter({ activeIndex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const [cardYOffsets, setCardYOffsets] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

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
      cards.map((card) => card.offsetTop + CHAR_TOP_OFFSET);

    const updateOffsets = () => setCardYOffsets(computeOffsets());
    updateOffsets();

    const ro = new ResizeObserver(updateOffsets);
    cards.forEach((card) => ro.observe(card));

    return () => {
      ro.disconnect();
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

  useEffect(() => {
    return () => {
      cardsRef.current.forEach((card) => {
        card.style.transition = '';
        card.style.opacity = '';
        card.style.transform = '';
      });
    };
  }, []);

  // Pause on prefers-reduced-motion
  useEffect(() => {
    if (!videoRef.current) return;
    if (reducedMotion) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion]);

  // Pause when off-screen; re-evaluates when reducedMotion changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !videoRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting && !reducedMotion) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <motion.div
        style={{ y: springY }}
        className="pointer-events-none absolute right-300 top-0"
      >
        {/* Left outer shadow */}
        <div className="absolute left-525 top-3625 h-112 w-950">
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
        <div className="absolute left-700 top-3625 h-112 w-587">
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
        <div className="absolute left-1662 top-3625 h-112 w-950">
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
        <div className="absolute left-1837 top-3625 h-112 w-587">
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
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          width={251}
          height={337}
          aria-hidden="true"
          className="block"
        >
          <source src="/zerowoni_walk.webm" type="video/webm" />
        </video>
      </motion.div>
    </div>
  );
}
