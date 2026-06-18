'use client';

import Link from 'next/link';
import { COWORK_START_HREF } from './cowork-content';

export function CoworkStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-300 py-200 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between gap-300">
        <p className="hidden text-[15px] font-semibold text-gray-800 md:block md:text-[18px]">
          코딩없이 AI한테 일 맡기는 방법 - 클로드 Cowork 완전 정복
        </p>
        <Link
          href={COWORK_START_HREF}
          className="w-full shrink-0 rounded-100 bg-rose-500 px-400 py-200 text-center text-[15px] font-semibold text-white transition-opacity hover:opacity-90 md:w-auto md:text-[16px]"
        >
          바로 시작하기
        </Link>
      </div>
    </div>
  );
}
