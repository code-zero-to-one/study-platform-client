'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { setCookie } from '@/shared/tanstack-query/cookie';

function RedirectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleRedirection = async () => {
      try {
        const accessToken = decodeURIComponent(
          searchParams.get('access-token') || '',
        );
        const isGuest = searchParams.get('is-guest');

        setCookie("accessToken", accessToken);
        setCookie("memberId", searchParams.get('member-id') || '');
        setCookie("socialImageURL", searchParams.get('profile-image-url') || '');

        if (isGuest === 'true') {
          window.location.href = '/sign-up';
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Redirection failed:', error);
      }
    };

    handleRedirection().catch(console.error);
  }, [searchParams, router, queryClient]); // 의존성 추가

  return <div>처리중...</div>;
}

// useSearchParams() should be wrapped in a suspense boundary
export default function RedirectionPage() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <RedirectionContent />
    </Suspense>
  );
}
