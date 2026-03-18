import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// [프로토타입 브랜치] 인증 검사 없이 모든 경로를 통과시킴.
// 실제 인증 로직이 필요하면 아래 주석 처리된 코드를 다시 활성화할 것.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// import { getAuthContext } from '@/features/auth/server/middleware/auth-context';
// import {
//   handleLogin,
//   handleProtected,
//   handlePublicSessionRoute,
//   handleSignUp,
// } from '@/features/auth/server/middleware/route-handlers';
// import {
//   resolveRoutePolicy,
//   ROUTE_POLICY_KINDS,
// } from '@/features/auth/server/middleware/route-policy';
//
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const ctx = getAuthContext(request);
//   const routePolicy = resolveRoutePolicy(pathname);
//
//   switch (routePolicy) {
//     case ROUTE_POLICY_KINDS.BYPASS:
//       return NextResponse.next();
//     case ROUTE_POLICY_KINDS.SIGN_UP:
//       return handleSignUp(request, ctx);
//     case ROUTE_POLICY_KINDS.LOGIN:
//       return handleLogin(request, ctx);
//     case ROUTE_POLICY_KINDS.PUBLIC_SESSION:
//       return handlePublicSessionRoute(request, ctx);
//     default:
//       return handleProtected(request, ctx);
//   }
// }

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
