'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/common/ui/button';
import { analyzeError, logError, type ErrorInfo } from '@/utils/error-handler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showDetails, setShowDetails] = useState(true); // 관리자는 기본적으로 상세 정보 표시

  useEffect(() => {
    const analyzed = analyzeError(error);
    setErrorInfo(analyzed);
    logError(analyzed, {
      digest: error.digest,
      url: window.location.href,
      admin: true,
    });
  }, [error]);

  if (!errorInfo) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-45px)] w-full flex-col items-center justify-center gap-5 px-4">
      <h1 className="text-2xl font-bold">관리자 페이지 오류</h1>
      <p className="max-w-md text-center text-gray-600">
        {errorInfo.userMessage}
      </p>

      {/* 관리자는 기본적으로 상세 정보 표시 */}
      <div className="flex w-full max-w-2xl flex-col items-center">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
        </button>

        {showDetails && (
          <div className="mt-3 rounded-lg bg-gray-50 p-4 text-left">
            <div className="space-y-2 font-mono text-xs">
              <div>
                <span className="font-bold">에러 타입:</span> {errorInfo.type}
              </div>
              {errorInfo.errorCode && (
                <div>
                  <span className="font-bold">에러 코드:</span>{' '}
                  {errorInfo.errorCode}
                </div>
              )}
              {errorInfo.statusCode && (
                <div>
                  <span className="font-bold">HTTP 상태:</span>{' '}
                  {errorInfo.statusCode}
                </div>
              )}
              {error.digest && (
                <div>
                  <span className="font-bold">Digest:</span> {error.digest}
                </div>
              )}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <div className="border-t pt-2">
                    <span className="font-bold">기술적 메시지:</span>
                    <pre className="mt-1 text-xs break-words whitespace-pre-wrap">
                      {errorInfo.technicalMessage}
                    </pre>
                  </div>
                  {error.stack && (
                    <div className="border-t pt-2">
                      <span className="font-bold">스택 트레이스:</span>
                      <pre className="mt-1 max-h-40 overflow-auto text-xs break-words whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" color="primary" size="large" onClick={reset}>
          다시 시도
        </Button>
        <Button
          type="button"
          color="secondary"
          size="large"
          onClick={() => router.push('/admin')}
        >
          관리자 홈으로
        </Button>
      </div>
    </div>
  );
}
