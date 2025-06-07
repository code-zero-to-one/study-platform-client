// 소셜 로그인시 리디렉션 되는 페이지로 url 파라미터로 받은 토큰을 쿠키에 저장함

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchUserData } from '@/features/auth/api/useAuth';
import { setCookie } from '@/shared/api/cookie';

export default function RedirectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleRedirection = async () => {
      try {
        const accessToken = decodeURIComponent(searchParams.get('access-token') || '');
        const isGuest = searchParams.get('is-guest');

        setCookie("accessToken", accessToken);

        if (isGuest === 'true') {
          await router.push('/sign-up');
        } else {
          // 쿼리 캐시에 사용자 데이터 저장
          await prefetchUserData(queryClient);
          await router.push('/');
        }
      } catch (error) {
        console.error('Redirection failed:', error);
      }
    };

    handleRedirection();
  }, [searchParams, router, queryClient]);

  return <div>RedirectionPage</div>;
}
