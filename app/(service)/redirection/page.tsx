'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { hashValue } from '@/shared/lib/hash';
import { setCookie } from '@/shared/tanstack-query/cookie';
import { getAttributionParams } from '@/shared/lib/attribution-tracker';

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
        const socialImageURL = decodeURIComponent(
          searchParams.get('profile-image-url') || '',
        );

        setCookie('accessToken', accessToken);
        setCookie('memberId', memberId);
        setCookie('socialImageURL', socialImageURL);

        if (isGuest === 'true') {
          router.push('/sign-up');
        } else {
          router.push('/home');
          router.refresh();
          
          const attributionParams = getAttributionParams();
          
          sendGTMEvent({
            event: 'custom_member_login',
            dl_timestamp: new Date().toISOString(),
            dl_member_id: hashValue(memberId),
            dl_login_method: authVendor || '',
            ...attributionParams,
          });
        }
      } catch (error) {
        console.error('Redirection failed:', error);
      }
    };

    handleRedirection().catch(console.error);
  }, [searchParams, router, queryClient]); // 의존성 추가

  return <></>;
}

// useSearchParams() should be wrapped in a suspense boundary
export default function RedirectionPage() {
  return (
    <Suspense fallback={<></>}>
      <RedirectionContent />
    </Suspense>
  );
}
