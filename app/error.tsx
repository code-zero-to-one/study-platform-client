'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import Button from '@/shared/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-45px)] flex-col items-center justify-center gap-400">
      <div className="flex flex-col items-center justify-center gap-150">
        <h1 className="font-designer-28b">
          서비스 이용에 불편드려 죄송합니다.
        </h1>
        <div className="flex flex-col items-center gap-50">
          <span className="font-designer-16m text-text-subtle">
            에러가 발생하여 페이지를 표시할 수 없습니다.
          </span>
          <span className="font-designer-16m text-text-subtle">
            잠시 뒤에 다시 시도해주세요.
          </span>
        </div>
      </div>
      <Button
        size="large"
        onClick={() => {
          startTransition(() => {
            router.refresh(); // 서버 컴포넌트들을 다시 렌더링
            reset(); // 에러 상태 초기화
          });
        }}
      >
        새로고침
      </Button>
    </div>
  );
}
