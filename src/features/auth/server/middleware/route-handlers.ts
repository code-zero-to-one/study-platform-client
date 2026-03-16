import type { NextRequest } from 'next/server';
import type { AuthContext } from './auth-context';
import { applyRouteAction } from './route-actions';
import {
  decideLoginRoute,
  decideProtectedRoute,
  decidePublicSessionRoute,
  decideSignUpRoute,
} from './route-decisions';
import { resolveRouteSession } from './route-session';

export async function handleSignUp(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);

  return applyRouteAction({
    request,
    action: decideSignUpRoute(session),
    session,
  });
}

export async function handlePublicSessionRoute(
  request: NextRequest,
  ctx: AuthContext,
) {
  const session = await resolveRouteSession(request, ctx);

  return applyRouteAction({
    request,
    action: decidePublicSessionRoute(session),
    session,
  });
}

export async function handleLogin(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);

  return applyRouteAction({
    request,
    action: decideLoginRoute(session),
    session,
  });
}

export async function handleProtected(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);

  return applyRouteAction({
    request,
    action: decideProtectedRoute(session, request.nextUrl.pathname),
    session,
  });
}
