'use client';

import { AnimatePresence, m } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

/* ─── Types ─────────────────────────────────────────── */

interface Floating {
  /** Absolute position/size expressed as % of the 395×575 card (responsive-safe). */
  style: CSSProperties;
}

interface BadgeDef extends Floating {
  text: string;
  /** Pill background color class. */
  bg: string;
  /** Render a leading "#" instead of the star icon. */
  hash?: boolean;
}

interface HeroCard {
  id: string;
  /** Card background color class. */
  bg: string;
  /** Circle background color class behind the portrait. */
  circleBg: string;
  topName: string;
  bottomTitle: string;
  photo: string;
  starBadge: BadgeDef;
  hashBadge: BadgeDef;
  preview: Floating & { className: string; src: string };
  rocket?: Floating;
}

/* ─── Data (Figma 136:6961 amber · 959:13512 rose) ──── */

const HERO_CARDS: HeroCard[] = [
  {
    id: 'amber',
    bg: 'bg-yellow-400',
    circleBg: 'bg-yellow-300',
    topName: '뭉다님의',
    bottomTitle: '포트폴리오',
    photo: '/landing/hero-card-a-photo.png',
    starBadge: {
      text: '나만의 웹사이트',
      bg: 'bg-yellow-100',
      style: { left: '78.2%', top: '30.8%' },
    },
    hashBadge: {
      text: '첫배포!',
      bg: 'bg-yellow-100',
      hash: true,
      style: { left: '-15.7%', top: '72.2%' },
    },
    preview: {
      className: 'border border-yellow-600',
      src: '/landing/hero-card-amber-preview.png',
      style: {
        left: '-62.3%',
        top: '13.9%',
        width: '88.1%',
        height: '41.2%',
      },
    },
    rocket: {
      style: {
        left: '77.2%',
        top: '48.9%',
        width: '45.3%',
        height: '36.2%',
      },
    },
  },
  {
    id: 'rose',
    bg: 'bg-rose-500',
    circleBg: 'bg-rose-300',
    topName: '성윤님의',
    bottomTitle: '사이드 프로젝트 랜딩',
    photo: '/landing/hero-card-b-photo.png',
    starBadge: {
      text: '사이드 프로젝트 랜딩',
      bg: 'bg-rose-100',
      style: { left: '-35.7%', top: '65.2%' },
    },
    hashBadge: {
      text: '바이브코딩 신기',
      bg: 'bg-rose-100',
      hash: true,
      style: { left: '75.2%', top: '17.4%' },
    },
    preview: {
      className: 'border border-rose-400',
      src: '/landing/hero-card-rose-preview.png',
      style: {
        left: '87.8%',
        top: '31.7%',
        width: '88.1%',
        height: '41.2%',
      },
    },
  },
];

const FLIP_INTERVAL = 4000;

/* ─── Floating badge ────────────────────────────────── */

function Badge({ badge, delay }: { badge: BadgeDef; delay: number }) {
  return (
    <m.div
      className={cn(
        'absolute z-20 flex items-center gap-125 whitespace-nowrap rounded-750 px-250 py-125 shadow-sm',
        badge.bg,
      )}
      style={badge.style}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 18 }}
    >
      {badge.hash ? (
        <span className="text-[13px] font-bold leading-normal text-black md:text-[16px]">
          #
        </span>
      ) : (
        <svg
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-225 shrink-0 md:size-275"
          aria-hidden="true"
        >
          <circle cx="11.5" cy="11.5" r="11.5" fill="#FDB022" />
          <path
            d="M10.8566 4.68595C11.0591 4.06271 11.9409 4.06271 12.1434 4.68595L13.3225 8.31504C13.4131 8.59376 13.6728 8.78247 13.9659 8.78247H17.7817C18.4371 8.78247 18.7095 9.62103 18.1794 10.0062L15.0923 12.2491C14.8552 12.4214 14.756 12.7267 14.8465 13.0054L16.0257 16.6345C16.2282 17.2578 15.5149 17.776 14.9847 17.3908L11.8976 15.1479C11.6605 14.9757 11.3395 14.9757 11.1024 15.1479L8.01529 17.3908C7.48513 17.776 6.77181 17.2578 6.97431 16.6345L8.15347 13.0054C8.24403 12.7267 8.14482 12.4214 7.90773 12.2491L4.82064 10.0062C4.29048 9.62103 4.56295 8.78247 5.21826 8.78247H9.03411C9.32718 8.78247 9.58691 8.59376 9.67747 8.31504L10.8566 4.68595Z"
            fill="white"
          />
        </svg>
      )}
      <span className="text-[13px] font-bold leading-normal tracking-[-0.304px] text-gray-800 md:text-[16px]">
        {badge.text}
      </span>
    </m.div>
  );
}

/* ─── Card face ─────────────────────────────────────── */

function CardFace({ card }: { card: HeroCard }) {
  return (
    <div
      className={cn(
        'relative h-full w-full overflow-visible rounded-500',
        card.bg,
      )}
    >
      {/* Top name */}
      <p
        className="absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-white md:text-[32px] lg:text-[40px]"
        style={{ top: '6.9%' }}
      >
        {card.topName}
      </p>

      {/* Bottom title */}
      <p
        className="absolute left-1/2 z-20 w-full -translate-x-1/2 px-200 text-center text-[20px] font-bold leading-[1.5] tracking-[-0.76px] text-white md:text-[28px] lg:text-[36px]"
        style={{ top: '80.5%' }}
      >
        {card.bottomTitle}
      </p>

      {/* Website preview (generated site mockup, desktop only) */}
      <div
        className={cn(
          'absolute z-0 hidden overflow-hidden rounded-250 lg:block',
          card.preview.className,
        )}
        style={card.preview.style}
      >
        <Image
          src={card.preview.src}
          alt=""
          fill
          className="object-cover object-top"
          sizes="350px"
        />
      </div>

      {/* Portrait inside circle */}
      <div
        className={cn(
          'absolute z-10 aspect-square overflow-hidden rounded-full',
          card.circleBg,
        )}
        style={{ left: '22.8%', top: '35.5%', width: '54.4%' }}
      >
        <Image
          src={card.photo}
          alt={card.topName}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 215px, 215px"
        />
      </div>

      {/* Rocket (desktop only) */}
      {card.rocket && (
        <m.div
          className="absolute z-10 hidden lg:block"
          style={card.rocket.style}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.28,
            type: 'spring',
            stiffness: 280,
            damping: 16,
          }}
        >
          <Image
            src="/landing/hero-rocket.png"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="180px"
          />
        </m.div>
      )}

      {/* Floating badges */}
      <Badge badge={card.starBadge} delay={0.12} />
      <Badge badge={card.hashBadge} delay={0.2} />
    </div>
  );
}

/* ─── Carousel ──────────────────────────────────────── */

export function HeroFlipCard() {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  // Use 3D flip on desktop with motion enabled; fade otherwise.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setFlip(desktop.matches && !reduce.matches);
    update();
    desktop.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  // Auto-cycle.
  useEffect(() => {
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % HERO_CARDS.length),
      FLIP_INTERVAL,
    );
    return () => clearTimeout(timer);
  }, [index]);

  const card = HERO_CARDS[index];
  const variants = flip
    ? {
        enter: { rotateY: 90, opacity: 0 },
        center: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
      }
    : {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-5000"
        style={{ perspective: '1200px' }}
      >
        {/* Aspect-ratio spacer keeps the absolute cards' height. */}
        <div className="aspect-395/575 w-full" aria-hidden />
        <AnimatePresence initial={false} mode="sync">
          <m.div
            key={card.id}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            <CardFace card={card} />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
