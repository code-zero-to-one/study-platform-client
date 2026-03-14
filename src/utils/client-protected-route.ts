const EXACT_PROTECTED_PATHS = new Set([
  '/admin',
  '/home',
  '/my-page',
  '/my-study',
  '/my-study-review',
  '/my-activity',
  '/payment-management',
  '/settlement-management',
  '/notification',
  '/note-consultation',
  '/my-mentoring',
  '/mentoring-management',
  '/mentoring/become-mentor',
]);

const PREFIX_PROTECTED_PATHS = [
  '/admin/',
  '/my-study/',
  '/my-mentoring/',
  '/mentoring-management/',
  '/payment/',
  '/group-study/',
  '/application-list/',
] as const;

const MENTORING_PROTECTED_ROUTE_PATTERN =
  /^\/mentoring\/[^/]+\/(apply|complete)$/;

export const isClientProtectedRoute = (pathname: string) => {
  if (EXACT_PROTECTED_PATHS.has(pathname)) {
    return true;
  }

  if (MENTORING_PROTECTED_ROUTE_PATTERN.test(pathname)) {
    return true;
  }

  return PREFIX_PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));
};
