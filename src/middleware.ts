import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRequestHeadersWithServerAuthSessionOverride } from '@/features/auth/model/server-auth-session-override';
import { getAuthContext } from '@/features/auth/server/middleware/auth-context';
import {
  handleLogin,
  handleProtected,
  handlePublicSessionRoute,
  handleSignUp,
} from '@/features/auth/server/middleware/route-handlers';
import {
  resolveRoutePolicy,
  ROUTE_POLICY_KINDS,
} from '@/features/auth/server/middleware/route-policy';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ctx = getAuthContext(request);
  const routePolicy = resolveRoutePolicy(pathname);

  switch (routePolicy) {
    case ROUTE_POLICY_KINDS.BYPASS:
      return NextResponse.next({
        request: {
          headers: createRequestHeadersWithServerAuthSessionOverride({
            requestHeaders: request.headers,
          }),
        },
      });
    case ROUTE_POLICY_KINDS.SIGN_UP:
      return handleSignUp(request, ctx);
    case ROUTE_POLICY_KINDS.LOGIN:
      return handleLogin(request, ctx);
    case ROUTE_POLICY_KINDS.PUBLIC_SESSION:
      return handlePublicSessionRoute(request, ctx);
    default:
      return handleProtected(request, ctx);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
