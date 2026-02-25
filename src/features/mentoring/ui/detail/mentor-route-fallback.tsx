'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';

export function MentorRouteLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-500 sm:px-300 xl:px-400">
      <div className="rounded-200 bg-background-alternative h-[260px] animate-pulse" />
    </div>
  );
}

export function MentorNotFoundState({
  message = '요청하신 멘토 정보를 찾을 수 없습니다.',
}: {
  message?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-500 sm:px-300 xl:px-400">
      <section className="rounded-200 border-border-subtle bg-background-default border px-300 py-500 text-center">
        <h1 className="font-designer-24b text-text-strong mb-100">
          멘토를 찾을 수 없습니다
        </h1>
        <p className="font-designer-14r text-text-subtle mb-250">{message}</p>
        <Link href="/mentoring">
          <Button color="primary" size="large">
            멘토링 목록으로 이동
          </Button>
        </Link>
      </section>
    </div>
  );
}
