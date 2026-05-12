'use client';

import { ChevronUp } from 'lucide-react';
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
        'fixed bottom-600 right-400 z-50 flex flex-col items-center gap-200 transition-opacity duration-300',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡 상담"
        tabIndex={visible ? 0 : -1}
        className="flex size-1500 items-center justify-center overflow-hidden rounded-full shadow-lg"
      >
        <Image
          src="/icons/kakao-channel.png"
          alt="카카오톡 채널"
          width={60}
          height={60}
          unoptimized
        />
      </a>

      <button
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        tabIndex={visible ? 0 : -1}
        className="flex size-1500 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-border-default hover:bg-gray-50 active:scale-95"
      >
        <ChevronUp className="h-300 w-300 text-gray-600" />
      </button>
    </div>
  );
}
