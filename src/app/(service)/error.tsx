'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/common/ui/button';
import { analyzeError, logError, type ErrorInfo } from '@/utils/error-handler';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ServiceError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 에러 분석 및 로깅
    const analyzed = analyzeError(error);
    setErrorInfo(analyzed);
    logError(analyzed, {
      digest: error.digest,
      url: window.location.href,
      // 서버 사이드 에러 정보 추가
      serverError: error.message,
      serverStack: error.stack,
      isServerError:
        !error.stack ||
        error.stack.includes('node_modules') ||
        error.stack.includes('next-server'),
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

      {/* 개발팀용 상세 정보 (접을 수 있게) */}
      <div className="flex w-full max-w-md flex-col items-center">
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
                  <span className="font-bold">서버 에러 Digest:</span>{' '}
                  {error.digest}
                  <p className="mt-1 text-xs text-gray-500">
                    이 Digest로 서버 로그에서 해당 에러를 찾을 수 있습니다.
                  </p>
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
                  {error.message && (
                    <div className="border-t pt-2">
                      <span className="font-bold">서버 에러 메시지:</span>
                      <pre className="mt-1 text-xs break-words whitespace-pre-wrap">
                        {error.message}
                      </pre>
                    </div>
                  )}
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
