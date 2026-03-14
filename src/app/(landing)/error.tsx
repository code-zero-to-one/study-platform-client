'use client';

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

export default function LandingError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const analyzed = analyzeError(error);
    setErrorInfo(analyzed);
    sendErrorToSentry(analyzed, {
      digest: error.digest,
      url: window.location.href,
    });
  }, [error]);

  if (!errorInfo) {
    return null;
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 px-4">
      <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
      <p className="max-w-md text-center text-gray-600">
        {errorInfo.userMessage}
      </p>

      <div className="flex gap-3">
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
