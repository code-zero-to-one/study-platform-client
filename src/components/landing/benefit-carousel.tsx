'use client';

import {
  m,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import Image from 'next/image';
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

/* ─── Entrance motion ───────────────────────────────── */

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

function SlideShell({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Latch visible once the slide scrolls into view, so a slide is never
  // permanently hidden if the JS `active` index ever desyncs from scroll.
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <m.div
      ref={ref}
      className="flex w-full flex-col items-center"
      variants={CONTENT_VARIANTS}
      initial="hidden"
      animate={active || inView ? 'show' : 'hidden'}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </m.div>
  );
}

/* ─── Shared number badge (01 · 02 · 03) ────────────── */
/* Figma: white circle (60px) centered above the title, dark text. */

function NumberBadge({ n, className }: { n: string; className?: string }) {
  return (
    <div
      className={cn(
        'mb-200 flex size-750 items-center justify-center rounded-full bg-gray-0',
        className,
      )}
    >
      <span className="text-[20px] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800 md:text-[30px]">
        {n}
      </span>
    </div>
  );
}

/* ─── Slot dispenser bar (Figma 1782:10327 / 10328) ──── */
/* Recessed dark pill the Claude Pro ticket slides out of. Colors
   (#202939 fill, #0f1624 inner lip) have no project token, so the bar
   is drawn as an inline SVG asset rather than hardcoded Tailwind. */

function SlotBar() {
  return (
    <svg
      viewBox="0 0 782 85"
      className="block h-auto w-full"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="774"
        height="77"
        rx="22"
        fill="#202939"
        stroke="#a4a7ae"
        strokeWidth="8"
      />
      <rect
        x="18"
        y="18"
        width="746"
        height="49"
        rx="12"
        fill="none"
        stroke="#0f1624"
        strokeWidth="20"
      />
    </svg>
  );
}

/* ─── Slide 0 · Intro (Figma 1782:10748) ────────────── */

function IntroSlide({ active }: { active: boolean }) {
  return (
    <SlideShell active={active}>
      <p className="font-signature text-[64px] leading-[1.5] text-gray-400 md:text-[120px] md:tracking-[-2.28px]">
        Benefit
      </p>
      <p className="mt-300 text-center text-[20px] font-bold leading-[1.5] tracking-[-0.76px] text-white md:-mt-200 md:text-[40px]">
        ZERO-ONE에서만 만나볼 수 있는 다양한
        <br />
        혜택을 즐겨보세요!
      </p>

      {/* Mouse scroll indicator (Figma 1782:10313: 75×114 outline, 4×26 bar at top 22, scroll text 18px below) */}
      <div className="mt-1000 flex flex-col items-center gap-225 md:mt-2000">
        <div className="flex h-1425 w-950 items-start justify-center rounded-full border-2 border-white pt-250">
          <m.span
            className="h-325 w-50 rounded-full bg-gray-0"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        <span className="text-[18px] leading-[1.5] tracking-[-0.57px] text-white md:text-[30px]">
          scroll
        </span>
      </div>
    </SlideShell>
  );
}

/* ─── Slide 1 · Claude Pro Gift (Figma 1782:10322) ────── */

function TicketDispenser({ active }: { active: boolean }) {
  return (
    <div className="relative aspect-[782/353] w-full">
      <div className="absolute inset-x-0 top-0">
        <SlotBar />
      </div>
      {/* Clip window: from the slot opening (top 2.3%) down to the bottom. */}
      <div className="absolute inset-x-0 bottom-0 top-[2.3%] z-10 overflow-hidden">
        {/* Ticket (Figma 1782:10329~10337): asset-composited so each layer
            keeps its Figma proportion at any width. */}
        <m.div
          className="absolute inset-x-[6.7%] inset-y-0"
          initial={{ y: '-100%' }}
          animate={active ? { y: '0%' } : { y: '-100%' }}
          transition={{
            delay: 0.15,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          {/* Coral ticket body (Subtract) — the SVG bakes in a drop shadow,
              so it bleeds past the 677×345 ticket bounds. */}
          <div className="absolute inset-[-11.3%_-2.36%_-7.25%_-7.09%]">
            <Image
              src="/landing/benefit-ticket-shape.svg"
              alt=""
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 796px"
            />
          </div>
          {/* Claude logo card (image 5): 168/677 wide at (254, 14) */}
          <div className="absolute left-[37.5%] top-[4%] aspect-square w-[24.8%] overflow-hidden rounded-[7.14%]">
            <Image
              src="/landing/benefit-ticket-logo.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 180px"
            />
          </div>
          {/* Wordmark + Pro + 1 month (Ticket Title): 565.66/677 wide at (63, 164) */}
          <div className="absolute left-[9.3%] top-[47.5%] aspect-[566/96] w-[83.5%]">
            <Image
              src="/landing/benefit-ticket-title.png"
              alt="Claude Pro 1개월 이용권"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 84vw, 607px"
            />
          </div>
          {/* Slot-entry shading strip (Rectangle 26): 677×53 at the ticket top,
              drawn above every other layer per Figma z-order. */}
          <div className="absolute inset-x-0 top-0 aspect-[677/53]">
            <Image
              src="/landing/benefit-ticket-strip.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 87vw, 727px"
            />
          </div>
        </m.div>
      </div>
    </div>
  );
}

function ClaudeProSlide({ active }: { active: boolean }) {
  return (
    <SlideShell active={active}>
      {/* Mobile: vertical stack (unchanged) */}
      <div className="flex w-full flex-col items-center md:hidden">
        <NumberBadge n="01" className="mb-250" />
        <p className="text-center text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-white">
          Claude Pro 1개월 Gift 증정
        </p>
        <div className="relative mt-1250 aspect-[782/353] w-full max-w-10500">
          <TicketDispenser active={active} />
        </div>
      </div>

      {/* Desktop (md+): Figma 1920×835 band — absolute coords keep the exact
          design ratio at any width; @container scales fonts via cqw. */}
      <div className="@container relative hidden aspect-[1920/835] w-full md:block">
        {/* Badge (60px sq) — centered, top 113/835 */}
        <div
          className="absolute left-1/2 flex aspect-square -translate-x-1/2 items-center justify-center rounded-full bg-gray-0"
          style={{ width: '3.125%', top: '13.53%' }}
        >
          <span className="text-[1.56cqw] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800">
            01
          </span>
        </div>
        {/* Title (40px) — centered, top 192/835 */}
        <p
          className="absolute left-1/2 -translate-x-1/2 text-center text-[2.08cqw] font-bold leading-[1.5] tracking-[-0.76px] text-white"
          style={{ top: '23.0%' }}
        >
          Claude Pro 1개월 Gift 증정
        </p>
        {/* Ticket dispenser — left 553/1920, top 353/835, w 782/1920 */}
        <div
          className="absolute"
          style={{ left: '28.8%', top: '42.28%', width: '40.73%' }}
        >
          <TicketDispenser active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

/* ─── Slide 2 · Study with Me (Figma 1782:10341 idle / 1782:10391 popped) ── */

/* Glossy shine overlay shared by both icons (Figma Vector 15~19): blurred
   glints + edge highlight lines. Positions/sizes are % of the icon box,
   container aspect matches each SVG viewBox so nothing distorts. */
const ICON_SHINE = [
  {
    src: '/landing/benefit-icon-spark-a.svg',
    className:
      'left-[91.3%] top-[9.4%] w-[8.2%] aspect-[14.77/22.1] rotate-[111.11deg]',
  },
  {
    src: '/landing/benefit-icon-spark-b.svg',
    className:
      'left-[8.6%] top-[9.5%] w-[6.5%] aspect-[11.73/19.6] rotate-[19.33deg]',
  },
  {
    src: '/landing/benefit-icon-spark-c.svg',
    className: 'left-[91.4%] top-[91%] w-[7.6%] aspect-[13.63/14.1] rotate-180',
  },
  {
    src: '/landing/benefit-icon-shine-bottom.svg',
    className: 'left-[48.1%] top-[96.7%] w-[70.6%] aspect-[127/9]',
  },
  {
    src: '/landing/benefit-icon-shine-right.svg',
    className: 'left-[95.6%] top-[49.9%] w-[71.4%] aspect-[128.5/5] rotate-90',
  },
] as const;

/* Each icon is composited live (gradient bg + hi-res logo + shine overlay)
   instead of a baked PNG, so the pop animation can rotate it in CSS and the
   logo stays sharp on retina (logo bitmaps are 780/1024px). Brand gradients
   (kakao yellow / discord blurple) have no project token. */
const ICON_SPECS = {
  kakao: {
    logo: '/landing/kakao-app.png',
    alt: '카카오톡 학습 알림톡',
    bg: 'left-[17.1%] bg-gradient-to-b from-[#fae300] from-[54.167%] to-[#b88e03]',
    poppedRotate: -20.93,
  },
  discord: {
    logo: '/landing/discord-app.png',
    alt: 'Discord 커뮤니티',
    bg: 'left-[49.9%] bg-gradient-to-b from-[#5a67ea] from-[54.167%] to-[#2531b4]',
    poppedRotate: 12.72,
  },
} as const;

function AppIcon({
  variant,
  active,
  delay,
}: {
  variant: keyof typeof ICON_SPECS;
  active: boolean;
  delay: number;
}) {
  const spec = ICON_SPECS[variant];
  return (
    <m.div
      // Idle: lodged in the toaster slot (Figma 1782:10341). Active: springs
      // up 105% of its height and tilts, like toast popping out (1782:10391).
      className={cn(
        'absolute top-[12.4%] aspect-square w-[31.1%] overflow-hidden rounded-375',
        spec.bg,
      )}
      initial={false}
      animate={
        active
          ? { y: '-105%', rotate: spec.poppedRotate }
          : { y: '0%', rotate: 0 }
      }
      transition={{ delay, type: 'spring', stiffness: 260, damping: 14 }}
    >
      <div className="absolute left-1/2 top-1/2 aspect-square w-[87.7%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_12.9px_rgba(0,0,0,0.25)]">
        <Image
          src={spec.logo}
          alt={spec.alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 28vw, 158px"
        />
      </div>
      {ICON_SHINE.map((shine) => (
        <div
          key={shine.src}
          className={cn(
            'absolute -translate-x-1/2 -translate-y-1/2',
            shine.className,
          )}
        >
          <Image src={shine.src} alt="" fill unoptimized />
        </div>
      ))}
    </m.div>
  );
}

/* Toaster (Figma 1782:10378): icons render BEHIND the toaster front (Figma
   z-order), so their lower halves read as "inside" the slot both when lodged and
   while popping — no clip wrapper needed. Popped icons overflow above the body
   (105% of icon height), so the parent must reserve headroom. Internals are
   %/aspect-based — shared by the mobile stack and the desktop Figma band. */
function ToasterStack({ active }: { active: boolean }) {
  return (
    <div className="relative aspect-[579/348] w-full">
      <AppIcon variant="kakao" active={active} delay={0.15} />
      <AppIcon variant="discord" active={active} delay={0.3} />
      <div className="absolute inset-0 z-10">
        <Image
          src="/landing/benefit-toaster.svg"
          alt="학습 알림 토스트기"
          fill
          unoptimized
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 580px"
        />
      </div>
    </div>
  );
}

function StudyWithMeSlide({ active }: { active: boolean }) {
  return (
    <SlideShell active={active}>
      {/* Mobile: vertical stack (unchanged) */}
      <div className="flex w-full flex-col items-center md:hidden">
        <NumberBadge n="02" />
        <p className="text-center text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-white">
          혼자 공부가 아닌 <span className="text-rose-400">함께 공부</span>해요!
          <br />
          학습 알림톡 &amp; Study with Me
        </p>
        {/* The top margin reserves headroom for the popped icons. */}
        <div className="relative mt-1500 aspect-[579/348] w-full max-w-7250">
          <ToasterStack active={active} />
        </div>
      </div>

      {/* Desktop (md+): Figma 1920×835 band */}
      <div className="@container relative hidden aspect-[1920/835] w-full md:block">
        {/* Badge — centered, top 53/835 */}
        <div
          className="absolute left-1/2 flex aspect-square -translate-x-1/2 items-center justify-center rounded-full bg-gray-0"
          style={{ width: '3.125%', top: '6.35%' }}
        >
          <span className="text-[1.56cqw] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800">
            02
          </span>
        </div>
        {/* Title — centered, top 130/835 */}
        <p
          className="absolute left-1/2 -translate-x-1/2 text-center text-[2.08cqw] font-bold leading-[1.5] tracking-[-0.76px] text-white"
          style={{ top: '15.57%' }}
        >
          혼자 공부가 아닌 <span className="text-rose-400">함께 공부</span>해요!
          <br />
          학습 알림톡 &amp; Study with Me
        </p>
        {/* Toaster — left 671/1920, top 488/835, w 579/1920 */}
        <div
          className="absolute"
          style={{ left: '34.95%', top: '58.44%', width: '30.16%' }}
        >
          <ToasterStack active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

/* ─── Slide 3 · Unlimited card stack (Figma 1782:10441) ───── */

/* Browser-window mockup inside the white card (Figma 1782:10463 etc.):
   gray body + light header bar with traffic-light dots. */
function BrowserWindow({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'absolute aspect-[352/240] w-[73.6%] overflow-hidden rounded-125 border border-gray-400 bg-gray-300',
        className,
      )}
    >
      <div className="flex h-350 items-center bg-gray-100 pl-150">
        <Image
          src="/landing/benefit-window-dots.png"
          alt=""
          width={42}
          height={10}
          className="h-125 w-525"
        />
      </div>
    </div>
  );
}

/* Card stack (Figma 1782:10447~10450 + 1894:11935): three skewed gray shadow
   cards fanned behind the white top card. Static — only the top card shows (no
   cycling). Offsets are % of the 478×563 card. @container scales the caption via
   cqw so it tracks the card width in both the mobile stack and the desktop band.
   Shared by both tracks. */
function CardStack({ active }: { active: boolean }) {
  return (
    <m.div
      className="@container relative aspect-[478/563] w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ delay: 0.15, duration: 0.55 }}
    >
      {/* shadow cards (Figma 1782:10447 / 10448 / 10449) — three SKEWED rounded
          rects fanned behind the white top card. Paint back→front: deepest
          gray-400 (skewX -6°, furthest right), then gray-300 (-4° right), then
          gray-300 (+2° left). Figma shears (skewX), not rotates. skewX preserves
          the rect center, so each is placed by its un-skewed top-left as a % of
          the 478×563 card; width 100% = card width, transform is non-spacing. */}
      <div
        className="absolute rounded-375 bg-gray-400"
        style={{
          left: '9.58%',
          top: '13.43%',
          width: '100%',
          height: '89.16%',
          transform: 'skewX(-6deg) scaleY(0.99)',
        }}
      />
      <div
        className="absolute rounded-375 bg-gray-300"
        style={{
          left: '6.54%',
          top: '8.95%',
          width: '100%',
          height: '92.9%',
          transform: 'skewX(-4deg)',
        }}
      />
      <div
        className="absolute rounded-375 bg-gray-300"
        style={{
          left: '-5.41%',
          top: '7.79%',
          width: '100%',
          height: '92.9%',
          transform: 'skewX(2deg)',
        }}
      />
      {/* top card (Figma 1894:11935) */}
      <div className="absolute inset-0 overflow-hidden rounded-375 bg-gray-0">
        <BrowserWindow className="left-[9.6%] top-[13.1%]" />
        <BrowserWindow className="left-[21.1%] top-[22%]" />
        <BrowserWindow className="left-[5.2%] top-[35.7%]" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center border-t border-gray-200 py-250 text-center text-[6.28cqw] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800">
          한 번 결제시 평생 수강
        </div>
      </div>
    </m.div>
  );
}

function UnlimitedSlide({ active }: { active: boolean }) {
  return (
    <SlideShell active={active}>
      {/* Mobile: vertical stack (unchanged) */}
      <div className="flex w-full flex-col items-center md:hidden">
        <NumberBadge n="03" />
        <p className="text-center text-[24px] font-bold leading-[1.5] tracking-[-0.76px] text-white">
          무제한으로 혜택을 즐기세요!
        </p>
        <div className="mt-400 w-full max-w-5950">
          <CardStack active={active} />
        </div>
      </div>

      {/* Desktop (md+): Figma 1920×835 band */}
      <div className="@container relative hidden aspect-[1920/835] w-full md:block">
        {/* Badge — centered, top 53/835 */}
        <div
          className="absolute left-1/2 flex aspect-square -translate-x-1/2 items-center justify-center rounded-full bg-gray-0"
          style={{ width: '3.125%', top: '6.35%' }}
        >
          <span className="text-[1.56cqw] font-bold leading-[1.5] tracking-[-0.57px] text-gray-800">
            03
          </span>
        </div>
        {/* Title — centered, top 130/835 */}
        <p
          className="absolute left-1/2 -translate-x-1/2 text-center text-[2.08cqw] font-bold leading-[1.5] tracking-[-0.76px] text-white"
          style={{ top: '15.57%' }}
        >
          무제한으로 혜택을 즐기세요!
        </p>
        {/* Card stack — centered, top 223/835, w 478/1920 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '26.71%', width: '24.9%' }}
        >
          <CardStack active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

/* ─── Carousel ──────────────────────────────────────── */

const SLIDES = [
  IntroSlide,
  ClaudeProSlide,
  StudyWithMeSlide,
  UnlimitedSlide,
] as const;

/**
 * Vertical-scroll-driven carousel: the outer container is one viewport tall
 * per slide, and the visible viewport pins (sticky) while page scroll
 * progress advances slides one at a time — scroll down for the next slide,
 * scroll up for the previous one. Native scroll only (no wheel hijacking),
 * so trackpad, touch, and keyboard scrolling all behave as expected.
 */
export function BenefitCarousel({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  // 0 → container top hits viewport top, 1 → container bottom hits viewport bottom.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map continuous progress to a discrete slide index (equal range per slide).
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setActive(
      Math.min(SLIDES.length - 1, Math.floor(progress * SLIDES.length)),
    );
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      // Scroll runway: one viewport height of scrolling per slide.
      style={{ height: `${SLIDES.length * 100}vh` }}
    >
      {/* Pinned viewport — stays on screen while the runway scrolls by. The
          bottom padding (sm+) clears the FloatingCTABar pill so the desktop
          illustration is never covered. */}
      <div className="sticky top-0 flex h-screen items-center sm:pb-2500">
        <div className={cn('w-full overflow-hidden', className)}>
          {/* Horizontal track: translated one slide width per step. */}
          <m.div
            className="flex w-full"
            initial={false}
            animate={{ x: `-${active * 100}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }
            }
          >
            {SLIDES.map((Slide, i) => (
              <div
                key={i}
                className="flex w-full shrink-0 items-center justify-center px-300 py-500"
              >
                <div className="relative w-full">
                  <Slide active={active === i} />
                </div>
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </div>
  );
}
