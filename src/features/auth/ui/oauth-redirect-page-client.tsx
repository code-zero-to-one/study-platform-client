'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useOAuthRedirectController } from '@/features/auth/model/use-oauth-redirect-controller';

function OAuthRedirectPageContent(): null {
  const searchParams = useSearchParams();

  useOAuthRedirectController(searchParams);

  return null;
}

export default function OAuthRedirectPageClient() {
  return (
    <Suspense fallback={null}>
      <OAuthRedirectPageContent />
    </Suspense>
  );
}
