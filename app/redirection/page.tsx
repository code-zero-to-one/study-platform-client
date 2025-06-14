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
        const accessToken = decodeURIComponent(searchParams.get('access-token') || '');
        const isGuest = searchParams.get('is-guest');

        setCookie("accessToken", accessToken);
        setCookie("memberId", searchParams.get('member-id') || '');
        setCookie("socialImageURL", searchParams.get('profile-image-url') || '');

        if (isGuest === 'true') {
          // 비회원일 경우 회원가입 페이지로 이동
          await router.push('/sign-up');
        } else {
          // 회원일 경우 쿼리 캐시 무효화
          await queryClient.invalidateQueries({ queryKey: ['memberInfo'] });
          await router.push('/');
          await router.refresh();
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