'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/common/ui/button';
import {
  analyzeError,
  sendErrorToSentry,
  type ErrorInfo,
} from '@/utils/error-handler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ServiceError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    // 서버 사이드 에러 감지
    // Next.js 서버 사이드 에러는 digest가 있거나 스택에 서버 관련 키워드가 있음
    const isServerSideError =
      error.digest !== undefined ||
      (error.stack &&
        (error.stack.includes('next-server') ||
          error.stack.includes('node_modules/next') ||
          error.stack.includes('server-components')));

    // 에러 분석 및 로깅
    const analyzed = analyzeError(error, { isServerSide: isServerSideError });

    // 서버 사이드 에러는 사용자에게 일반적인 메시지만 표시
    if (isServerSideError) {
      setErrorInfo({
        ...analyzed,
        userMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalMessage: analyzed.technicalMessage, // Sentry에는 상세 정보 전송
      });
    } else {
      setErrorInfo(analyzed);
    }

    // Sentry 전송 (서버 에러는 상세 정보 포함)
    sendErrorToSentry(analyzed, {
      digest: error.digest,
      url: window.location.href,
      // 서버 사이드 에러 정보 추가
      serverError: error.message,
      serverStack: error.stack,
      isServerError: isServerSideError,
    });
  }, [error]);

  if (!errorInfo) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-45px)] w-full flex-col items-center justify-center gap-150 px-4">
      <Image src="/images/404.png" alt="에러 페이지" width={256} height={221} />
      <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>

      {/* 사용자 친화적 메시지 */}
      <p className="max-w-md text-center text-gray-600">
        {errorInfo.userMessage}
      </p>

      <div className="flex gap-100">
        <Button type="button" color="primary" size="large" onClick={reset}>
          다시 시도
        </Button>
        <Button
          type="button"
          color="secondary"
          size="large"
          onClick={() => router.push('/')}
        >
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}
