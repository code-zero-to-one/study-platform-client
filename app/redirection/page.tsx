'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { hashValue } from '@/shared/lib/hash';
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
        const memberId = searchParams.get('member-id');
        const authVendor = searchParams.get('auth-vendor');

        setCookie('accessToken', accessToken);
        setCookie('memberId', memberId);
        setCookie(
          'socialImageURL',
          searchParams.get('profile-image-url') || '',
        );

        if (isGuest === 'true') {
          router.push('/sign-up');
          // isGuest가 true 인 경우 memberId가 없어서 아래 hashValue 에서 에러가 남.
          // 따라서 해당 이벤트는 회원가입 직후인 'sign-up-modal.tsx' 로 이동.

          // sendGTMEvent({
          //   event: 'custom_member_join',
          //   dl_timestamp: new Date().toISOString(),
          //   dl_member_id: hashValue(memberId),
          // });
        } else {
          router.push('/');
          router.refresh();
          sendGTMEvent({
            event: 'custom_member_login',
            dl_timestamp: new Date().toISOString(),
            dl_member_id: hashValue(memberId),
            dl_login_method: authVendor || '',
          });
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
