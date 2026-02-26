'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';
import PageContainer from '@/components/ui/page-container';
import SurfacePanel from '@/components/ui/surface-panel';

export function MentorRouteLoading() {
  return (
    <PageContainer spacing="fallback">
      <div className="rounded-200 bg-background-alternative h-[260px] animate-pulse" />
    </PageContainer>
  );
}

export function MentorNotFoundState({
  message = '요청하신 멘토 정보를 찾을 수 없습니다.',
}: {
  message?: string;
}) {
  return (
    <PageContainer spacing="fallback">
      <SurfacePanel radius="lg" className="px-300 py-500 text-center">
        <h1 className="font-designer-24b text-text-strong mb-100">
          멘토를 찾을 수 없습니다
        </h1>
        <p className="font-designer-14r text-text-subtle mb-250">{message}</p>
        <Link href="/mentoring">
          <Button color="primary" size="large">
            멘토링 목록으로 이동
          </Button>
        </Link>
      </SurfacePanel>
    </PageContainer>
  );
}
