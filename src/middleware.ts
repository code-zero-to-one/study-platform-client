import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApiError } from '@/api/client/api-error';
import { decodeJwt } from '@/utils/jwt';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

const verifyAccessToken = async (accessToken: string) => {
  try {
    // Access token로 memberId만 반환하는 api
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      if (isApiError(errorData) && errorData.errorCode === 'AUTH001') {
        return { state: 'invalid' };
      }

      return { state: 'unknownError' };
    }

    const data: { content: { memberId: number; roleId: string } } =
      await response.json();

    return { state: 'valid', memberId: data.content.memberId };
  } catch (error) {
    return { state: 'unknownError' };
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await getServerCookie('refresh_token');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/access-token/refresh`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          cookie: `refresh_token=${refreshToken}`, // 쿠키를 수동으로 전송
        },
      },
    );

    if (!response.ok) return null;

    const data: { content: { accessToken: string } } = await response.json();

    return data.content.accessToken;
  } catch (error) {
    return null;
  }
};

// 토큰 갱신 성공 시 쿠키 일괄 적용
function applyNewToken(response: NextResponse, token: string): void {
  response.cookies.set('accessToken', token, ACCESS_TOKEN_COOKIE_OPTIONS);
  const decoded = decodeJwt(token);
  if (decoded?.memberId !== undefined) {
    response.cookies.set('memberId', String(decoded.memberId), { path: '/' });
  }
}

// 인증 쿠키 전체 삭제
function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete('accessToken');
  response.cookies.delete('memberId');
  response.cookies.delete('socialImageURL');
}

interface AuthContext {
  accessToken: string | undefined;
  memberId: string | undefined;
  hasAccessToken: boolean;
  hasMemberId: boolean;
}

function getAuthContext(request: NextRequest): AuthContext {
  const accessToken = request.cookies.get('accessToken')?.value;
  const memberId = request.cookies.get('memberId')?.value;

  return {
    accessToken,
    memberId,
    hasAccessToken: request.cookies.has('accessToken'),
    hasMemberId: request.cookies.has('memberId') && isNumeric(memberId),
  };
}

// /sign-up
function handleSignUp(request: NextRequest, ctx: AuthContext): NextResponse {
  if (ctx.hasAccessToken && ctx.hasMemberId) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  if (!ctx.hasAccessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

    return NextResponse.next();
  }

  // 그룹스터디 상세: 비회원도 접근 가능, 로그인된 사용자는 토큰 갱신만 수행
  if (request.nextUrl.pathname.startsWith('/group-study')) {
    // 비회원(토큰 없음)은 그대로 통과
    if (!hasAccessToken || !hasMemberId || !accessToken) {
      return NextResponse.next();
    }

    // 로그인된 사용자는 토큰 유효성 검증 후 필요 시 갱신
    const verifyResponse = await verifyAccessToken(accessToken);
    const response = NextResponse.next();

    if (verifyResponse.state === 'invalid') {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // 갱신 성공 → 새 토큰 쿠키 저장
        response.cookies.set(
          'accessToken',
          newAccessToken,
          ACCESS_TOKEN_COOKIE_OPTIONS,
        );
      } else {
        // refresh token도 만료 → 쿠키 삭제 후 비회원으로 통과
        response.cookies.delete('accessToken');
        response.cookies.delete('memberId');
      }
    }

    return response;
  }

// /group-study/* — 비회원도 접근 가능, 로그인된 사용자는 토큰 갱신 + memberId 정규화
async function handleGroupStudy(
  _: NextRequest,
  ctx: AuthContext,
): Promise<NextResponse> {
  const response = NextResponse.next();

  // 비회원(accessToken 없음): identity 쿠키 삭제 후 통과 (쿠키 위조 방지)
  if (!ctx.accessToken) {
    clearAuthCookies(response);

    return response;
  }

  const verify = await verifyAccessToken(ctx.accessToken);

  if (verify.state === 'invalid') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // 갱신 성공 → 새 토큰 쿠키 저장
      applyNewToken(response, newToken);
    } else {
      // refresh token도 만료 → 쿠키 삭제 후 비회원으로 통과
      clearAuthCookies(response);
    }
  } else if (verify.state === 'valid' && verify.memberId !== undefined) {
    // 서버 검증된 memberId로 쿠키 정규화 (임의 위조 방지)
    const serverMemberId = String(verify.memberId);
    if (ctx.memberId !== serverMemberId) {
      response.cookies.set('memberId', serverMemberId, { path: '/' });
    }
  } else {
    // unknownError: 검증 불확실 → memberId 쿠키 삭제 (fail-secure)
    // accessToken은 유지 — 일시적 오류일 수 있으며, 다음 요청에서 재검증됨
    response.cookies.delete('memberId');
    response.cookies.delete('socialImageURL');
  }

  return response;
}

// /login
async function handleLogin(
  request: NextRequest,
  ctx: AuthContext,
): Promise<NextResponse> {
  if (ctx.hasAccessToken && ctx.hasMemberId && ctx.accessToken) {
    const verify = await verifyAccessToken(ctx.accessToken);

    if (verify.state === 'valid') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // 만료/유효하지 않은 토큰으로 로그인 페이지 진입 시 루프 방지를 위해 세션 쿠키를 정리
    const response = NextResponse.next();
    clearAuthCookies(response);

    return response;
  }

  return NextResponse.next();
}

// 나머지 모든 인증 필요 경로
async function handleProtected(
  request: NextRequest,
  ctx: AuthContext,
): Promise<NextResponse> {
  if (!ctx.hasAccessToken || !ctx.hasMemberId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const verify = await verifyAccessToken(ctx.accessToken!);
  const response = NextResponse.next();
  let effectiveToken = ctx.accessToken!;

  if (verify.state === 'invalid') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // 갱신 성공
      response.cookies.set(
        'accessToken',
        newAccessToken,
        ACCESS_TOKEN_COOKIE_OPTIONS,
      );
    } else {
      // 갱신 실패 - 쿠키 삭제 후 랜딩 페이지로 리디렉션
      const landingResponse = NextResponse.redirect(new URL('/', request.url));
      clearAuthCookies(landingResponse);

      return landingResponse;
    }
  }

  // 관리자 페이지 권한 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const decoded = decodeJwt(effectiveToken);
    if (!decoded?.roleIds.includes('ROLE_ADMIN')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ctx = getAuthContext(request);

  if (pathname === '/') return NextResponse.next();
  if (pathname === '/sign-up') return handleSignUp(request, ctx);
  if (pathname.startsWith('/group-study'))
    return handleGroupStudy(request, ctx);
  if (pathname === '/login') return handleLogin(request, ctx);

  return handleProtected(request, ctx);
}

// middleware가 적용될 경로 설정
export const config = {
  matcher: [
    '/',
    '/login',
    '/my-page',
    '/payment-management',
    '/settlement-management',
    '/my-study',
    '/my-study-review',
    '/sign-up',
    '/payment/:path*', // 결제 관련 모든 경로
    '/admin/:path*',
    '/group-study/:path*', // 그룹스터디 상세 (비회원 접근 가능, 토큰 갱신 필요)
  ],
};
