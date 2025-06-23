'use client';

import { sendGTMEvent } from '@next/third-parties/google';
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
        const memberId = searchParams.get('member-id');

        setCookie('accessToken', accessToken);
        setCookie('memberId', memberId);
        setCookie(
          'socialImageURL',
          searchParams.get('profile-image-url') || '',
        );

        if (isGuest === 'true') {
          router.push('/sign-up');
          sendGTMEvent({
            event: 'member_join',
            timestamp: new Date().toISOString(),
            dl_member_id: memberId,
          });
        } else {
          // todo: login_method는 google 또는 kakao로 설정
          router.push('/');
          router.refresh();
          sendGTMEvent({
            event_name: 'member_login',
            timestamp: new Date().toISOString(),
            dl_member_id: memberId,
            dl_login_method: '',
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
