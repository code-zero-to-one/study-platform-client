'use client';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import PageContainer from '@/components/common/ui/page-container';
import SurfacePanel from '@/components/common/ui/surface-panel';
export function MentorRouteLoading() {
  return (
    <PageContainer spacing="fallback">
      {' '}
      <div className="rounded-200 bg-background-alternative h-[260px] animate-pulse" />{' '}
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
      {' '}
      <SurfacePanel radius="lg" className="px-300 py-500 text-center">
        {' '}
        <h1 className="mb-100 font-designer-24b text-text-strong">
          {' '}
          멘토를 찾을 수 없습니다{' '}
        </h1>{' '}
        <p className="mb-250 font-designer-14r text-text-subtle">{message}</p>{' '}
        <Link href="/mentoring">
          {' '}
          <Button color="primary" size="large">
            {' '}
            멘토링 목록으로 이동{' '}
          </Button>{' '}
        </Link>{' '}
      </SurfacePanel>{' '}
    </PageContainer>
  );
}
export function MentorRouteErrorState({
  message = '멘토 정보를 불러오는 중 오류가 발생했습니다.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <PageContainer spacing="fallback">
      {' '}
      <SurfacePanel radius="lg" className="px-300 py-500 text-center">
        {' '}
        <h1 className="mb-100 font-designer-24b text-text-strong">
          {' '}
          멘토 정보를 불러오지 못했습니다{' '}
        </h1>{' '}
        <p className="mb-250 font-designer-14r text-text-subtle">{message}</p>{' '}
        <div className="flex items-center justify-center gap-100">
          {' '}
          {onRetry && (
            <Button color="outlined" size="large" onClick={onRetry}>
              {' '}
              다시 시도{' '}
            </Button>
          )}{' '}
          <Link href="/mentoring">
            {' '}
            <Button color="primary" size="large">
              {' '}
              멘토링 목록으로 이동{' '}
            </Button>{' '}
          </Link>{' '}
        </div>{' '}
      </SurfacePanel>{' '}
    </PageContainer>
  );
}
