'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/ui/button';
import { analyzeError, logError, type ErrorInfo } from '@/utils/error-handler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LandingError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const analyzed = analyzeError(error);
    setErrorInfo(analyzed);
    logError(analyzed, {
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
      <p className="text-center text-gray-600 max-w-md">
        {errorInfo.userMessage}
      </p>

      {/* 개발팀용 상세 정보 */}
      <div className="w-full max-w-md flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          {showDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
        </button>
        
        {showDetails && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-left">
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="font-bold">에러 타입:</span> {errorInfo.type}
              </div>
              {errorInfo.errorCode && (
                <div>
                  <span className="font-bold">에러 코드:</span> {errorInfo.errorCode}
                </div>
              )}
              {errorInfo.statusCode && (
                <div>
                  <span className="font-bold">HTTP 상태:</span> {errorInfo.statusCode}
                </div>
              )}
              {error.digest && (
                <div>
                  <span className="font-bold">Digest:</span> {error.digest}
                </div>
              )}
              <div className="pt-2 border-t">
                <span className="font-bold">기술적 메시지:</span>
                <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                  {errorInfo.technicalMessage}
                </pre>
              </div>
              {error.stack && (
                <div className="pt-2 border-t">
                  <span className="font-bold">스택 트레이스:</span>
                  <pre className="mt-1 text-xs whitespace-pre-wrap break-words max-h-40 overflow-auto">
                    {error.stack}
                  </pre>
                </div>
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
          onClick={() => router.push('/')}
        >
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}

