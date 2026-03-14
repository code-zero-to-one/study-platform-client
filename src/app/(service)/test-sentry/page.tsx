'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { ApiError } from '@/api/client/api-error';
import Button from '@/components/common/ui/button';
import { analyzeError, sendErrorToSentry } from '@/utils/error-handler';

export default function TestSentryPage() {
  const [result, setResult] = useState<string>('');

  const testClientError = async () => {
    try {
      // 실제 클라이언트 렌더링 에러 시뮬레이션 (null 접근 등)
      const obj: { prop?: string } | null = null;
      // 테스트를 위해 의도적으로 null 접근 (런타임 에러 발생)
       
      const value = obj!.prop; // TypeError: Cannot read property 'prop' of null
      console.log(value);
    } catch (error) {
      const errorInfo = analyzeError(error);
      sendErrorToSentry(errorInfo, { testType: 'client-error' });
      setResult(
        `✅ 클라이언트 에러 전송 완료: ${errorInfo.type} - ${errorInfo.technicalMessage}`,
      );
    }
  };

  const testNetworkError = async () => {
    try {
      // 실제 환경처럼: 네트워크 에러는 fetch가 실패하여 TypeError 발생
      // 존재하지 않는 도메인으로 요청하여 네트워크 에러 시뮬레이션
      await fetch(
        'https://invalid-domain-that-does-not-exist-12345.com/api/test',
        {
          signal: AbortSignal.timeout(1000), // 1초 타임아웃
        },
      );
    } catch (error) {
      const errorInfo = analyzeError(error);
      sendErrorToSentry(errorInfo, { testType: 'network-error' });
      setResult(
        `✅ 네트워크 에러 전송 완료: ${errorInfo.type} - ${errorInfo.technicalMessage}`,
      );
    }
  };

  const testServerError = async () => {
    try {
      // Next.js 서버 사이드 에러 테스트
      // API 라우트에서 실제 에러를 throw하여 서버 사이드 에러 시뮬레이션
      const res = await fetch('/api/test-sentry?type=server-error', {
        cache: 'no-store',
      });

      // 서버 사이드에서 에러가 throw되면 응답이 오지 않거나 에러 응답이 옴
      if (!res.ok) {
        const errorText = await res.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || '서버 내부 오류가 발생했습니다' };
        }

        throw new ApiError({
          statusCode: res.status,
          errorCode: errorData.errorCode || 'CMM002',
          errorName: errorData.errorName || 'InternalServerError',
          message: errorData.message || '서버 내부 오류가 발생했습니다',
        });
      }
    } catch (error) {
      const errorInfo = analyzeError(error);
      // 서버 사이드 에러는 SERVER 타입으로 분류되어야 함
      sendErrorToSentry(errorInfo, {
        testType: 'server-error',
        isServerSide: true, // 서버 사이드 에러임을 명시
      });
      setResult(
        `✅ 서버 에러 전송 완료: ${errorInfo.type} - ${errorInfo.errorCode || '에러 발생'}`,
      );
    }
  };

  const testApiError = async () => {
    try {
      // 실제 환경처럼: API 에러는 ApiError 형식으로 반환됨
      const res = await fetch('/api/test-sentry?type=api-error');
      if (!res.ok) {
        const data = await res.json();
        // ApiError 형식으로 에러 생성
        throw new ApiError({
          statusCode: res.status,
          errorCode: data.errorCode || 'TEST001',
          errorName: data.errorName || 'TestError',
          message: data.message || '테스트 API 에러',
        });
      }
    } catch (error) {
      const errorInfo = analyzeError(error);
      sendErrorToSentry(errorInfo, { testType: 'api-error' });
      setResult(
        `✅ API 에러 전송 완료: ${errorInfo.type} - ${errorInfo.errorCode}`,
      );
    }
  };

  const testAuthError = async () => {
    try {
      // 실제 환경처럼: 인증 에러는 ApiError 형식으로 반환됨
      const res = await fetch('/api/test-sentry?type=auth-error');
      if (!res.ok) {
        const data = await res.json();
        // ApiError 형식으로 에러 생성
        throw new ApiError({
          statusCode: res.status,
          errorCode: data.errorCode || 'AUTH001',
          errorName: data.errorName || 'TokenExpired',
          message: data.message || '토큰이 만료되었습니다',
        });
      }
    } catch (error) {
      const errorInfo = analyzeError(error);
      sendErrorToSentry(errorInfo, { testType: 'auth-error' });
      setResult(
        `✅ 인증 에러 전송 완료: ${errorInfo.type} - ${errorInfo.errorCode} (필터링됨)`,
      );
    }
  };

  const testDirectSentry = () => {
    try {
      // Sentry에 직접 전송 (beforeSend 필터링 테스트)
      Sentry.withScope((scope) => {
        scope.setTag('test.type', 'direct-sentry');
        scope.setExtra('test.message', '직접 Sentry로 전송한 테스트 에러');
        Sentry.captureException(new Error('직접 Sentry 전송 테스트'));
      });
      setResult('✅ Sentry 직접 전송 완료');
    } catch (error) {
      setResult(`❌ Sentry 직접 전송 실패: ${error}`);
    }
  };

  const testMessage = () => {
    Sentry.withScope((scope) => {
      scope.setTag('test.type', 'message');
      scope.setExtra('test.message', '테스트 메시지');
      Sentry.captureMessage('테스트 메시지입니다', 'error');
    });
    setResult('✅ Sentry 메시지 전송 완료');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Sentry 테스트 페이지</h1>
      <p className="mb-4 text-gray-600">
        각 버튼을 클릭하여 다양한 에러 타입을 Sentry로 전송해보세요.
        <br />
        Sentry 대시보드에서 확인할 수 있습니다.
      </p>

      <div className="mb-6 space-y-3">
        <Button
          onClick={testClientError}
          color="primary"
          size="large"
          className="w-full"
        >
          클라이언트 에러 테스트 (CLIENT)
        </Button>
        <Button
          onClick={testNetworkError}
          color="primary"
          size="large"
          className="w-full"
        >
          네트워크 에러 테스트 (NETWORK)
        </Button>
        <Button
          onClick={testServerError}
          color="primary"
          size="large"
          className="w-full"
        >
          서버 에러 테스트 (SERVER - API 라우트)
        </Button>
        <Button
          onClick={() => {
            window.location.href = '/test-sentry-server-error';
          }}
          color="primary"
          size="large"
          className="w-full"
        >
          서버 에러 테스트 (SERVER - 서버 컴포넌트)
        </Button>
        <Button
          onClick={testApiError}
          color="primary"
          size="large"
          className="w-full"
        >
          API 에러 테스트 (CLIENT)
        </Button>
        <Button
          onClick={testAuthError}
          color="primary"
          size="large"
          className="w-full"
        >
          인증 에러 테스트 (AUTH - 필터링됨)
        </Button>
        <Button
          onClick={testDirectSentry}
          color="secondary"
          size="large"
          className="w-full"
        >
          Sentry 직접 전송 테스트
        </Button>
        <Button
          onClick={testMessage}
          color="secondary"
          size="large"
          className="w-full"
        >
          Sentry 메시지 전송 테스트
        </Button>
      </div>

      {result && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="font-mono text-sm">{result}</p>
        </div>
      )}

      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 font-bold">확인 방법</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>브라우저 콘솔에서 에러 로그 확인</li>
          <li>
            <a
              href="https://code0to1.sentry.io/issues/?project=4511014077530112"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Sentry 대시보드
            </a>
            에서 Issues 확인
          </li>
          <li>
            인증 에러(AUTH001)는 beforeSend에서 필터링되어 전송되지 않습니다
          </li>
        </ul>
      </div>
    </div>
  );
}
