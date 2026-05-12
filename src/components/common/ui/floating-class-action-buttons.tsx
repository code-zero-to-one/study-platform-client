'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xoGxaAG';

export default function FloatingClassActionButtons() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed bottom-600 right-1375 z-50 flex flex-col items-center gap-400 transition-opacity duration-300',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
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
