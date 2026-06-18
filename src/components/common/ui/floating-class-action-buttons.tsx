'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const KAKAO_CHANNEL_URL = 'http://pf.kakao.com/_VmCYn';
const FOOTER_GAP = 24;
// SSR defaults mirror the `bottom-1500` / `sm:bottom-2500` className tokens.
const DEFAULT_BOTTOM = 120;
const DEFAULT_BOTTOM_SM = 200;
const SM_BREAKPOINT = 640;

export default function FloatingClassActionButtons({
  scrollContainerSelector,
}: {
  scrollContainerSelector?: string;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      let bottom =
        window.innerWidth >= SM_BREAKPOINT ? DEFAULT_BOTTOM_SM : DEFAULT_BOTTOM;
      // Re-query every tick: both neighbors are optional per layout (footer on
      // landing, inquiry pill on study-detail) and the inquiry pill can mount a
      // frame after this effect runs. The FAB sits above whichever floating
      // neighbor is currently lower in the viewport.
      const footer = document.querySelector('footer');
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        if (footerTop < vh) {
          bottom = Math.max(bottom, vh - footerTop + FOOTER_GAP);
        }
      }
      const inquiry = document.querySelector<HTMLElement>(
        '[data-floating-inquiry]',
      );
      if (inquiry) {
        const inquiryTop = inquiry.getBoundingClientRect().top;
        bottom = Math.max(bottom, vh - inquiryTop + FOOTER_GAP);
      }
      el.style.bottom = `${bottom}px`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    // Second pass next frame to catch the inquiry pill if it mounts late.
    const initialFrame = window.requestAnimationFrame(update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialFrame);
    };
  }, []);

  const scrollToTop = () => {
    const target = scrollContainerSelector
      ? document.querySelector<HTMLElement>(scrollContainerSelector)
      : null;
    (target ?? window).scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-1500 right-600 z-50 flex flex-col items-center gap-400 sm:bottom-2500"
    >
      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡 상담"
        className="flex size-875 items-center justify-center overflow-hidden rounded-full shadow-lg"
      >
        <Image
          src="/icons/kakao-channel.png"
          alt="카카오톡 채널"
          width={70}
          height={70}
          unoptimized
        />
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        className="flex size-875 flex-col items-center justify-center rounded-full border border-gray-300 bg-background-default shadow-1"
      >
        <svg
          viewBox="0 0 23.4433 14.9"
          className="-rotate-90 -scale-x-100 size-300 text-gray-500"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M22.11 6.11H4.55L8.39 2.27C8.91 1.75 8.91 0.91 8.39 0.39C7.87 -0.13 7.03 -0.13 6.51 0.39L0.39 6.51C-0.13 7.03 -0.13 7.87 0.39 8.39L6.51 14.51C7.03 15.03 7.87 15.03 8.39 14.51C8.91 13.99 8.91 13.15 8.39 12.63L4.55 8.77667H22.11C22.8433 8.77667 23.4433 8.17667 23.4433 7.44333C23.4433 6.71 22.8433 6.11 22.11 6.11Z" />
        </svg>
        <span className="font-designer-16r text-gray-500">TOP</span>
      </button>
    </div>
  );
}
