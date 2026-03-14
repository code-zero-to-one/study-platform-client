import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  switch (type) {
    case 'client-error':
      // 클라이언트 에러는 렌더링 에러이므로 API에서 처리하지 않음
      return NextResponse.json(
        {
          errorCode: 'CMM002',
          errorName: 'InternalServerError',
          message: '서버 내부 오류가 발생했습니다',
        },
        { status: 500 },
      );

    case 'server-error':
      // Next.js 서버 사이드 에러 시뮬레이션 (API 라우트에서 실제 에러 throw)
      // 이렇게 하면 Next.js가 서버 사이드 에러로 처리하고 Error Boundary를 트리거합니다.
      throw new Error(
        'Next.js 서버 사이드 에러: API 라우트에서 발생한 서버 에러',
      );

    case 'api-error':
      // API 에러 형식으로 응답
      return NextResponse.json(
        {
          errorCode: 'TEST001',
          errorName: 'TestError',
          message: '테스트 API 에러입니다',
        },
        { status: 400 },
      );

    case 'auth-error':
      // 인증 에러 (AUTH001 - beforeSend에서 필터링됨)
      return NextResponse.json(
        {
          errorCode: 'AUTH001',
          errorName: 'TokenExpired',
          message: '토큰이 만료되었습니다',
        },
        { status: 401 },
      );

    default:
      return NextResponse.json(
        { message: '테스트 타입을 지정해주세요' },
        { status: 400 },
      );
  }
}
