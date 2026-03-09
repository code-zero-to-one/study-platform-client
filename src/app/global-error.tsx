'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// 루트 레벨 최후의 에러 바운더리 route gruop의 error.tsx 에서 못잡는 더 바깥쪽 에러를 처리하는 컴포넌트

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '16px',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            오류가 발생했습니다
          </h1>
          <p style={{ color: '#666' }}>잠시 후 다시 시도해주세요.</p>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#999' }}>
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '8px 24px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              background: '#fff',
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
