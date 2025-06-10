// 소셜 로그인시 리디렉션 되는 페이지로 url 파라미터로 받은 토큰을 쿼리캐시에 저장함

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { setCookie } from '@/shared/api/cookie';

export default function RedirectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  searchParams.forEach((value, key) => {
    console.log(key, value);
  });

  useEffect(() => {
    const handleRedirection = async () => {
      try {
        const accessToken = decodeURIComponent(searchParams.get('access-token') || '');
        const isGuest = searchParams.get('is-guest');

        setCookie("accessToken", accessToken);
        setCookie("memberId", searchParams.get('member-id') || '');

        if (isGuest === 'true') {
          // 비회원일 경우 회원가입 페이지로 이동
          await router.push('/sign-up');
        } else {
          // 회원일 경우 쿼리 캐시 무효화
          awaitqueryClient.invalidateQueries({ queryKey: ['memberInfo'] });
          await router.push('/');
        }
      } catch (error) {
        console.error('Redirection failed:', error);
      }
    };

    handleRedirection().catch(console.error);
  }, []);

  return <div>RedirectionPage</div>;
}
