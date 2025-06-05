// 소셜 로그인 이후 Redirect 되는 페이지
// 백엔드 서버에서 accessToken 등의 데이터 전달 방법이 쿠키에서 쿼리파라미터로 변경됨에 따라 추가되었음

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

export default function RedirectionPage() {
  return (
    // useSearchParams() should be wrapped in a Suspense boundary
    <Suspense>
      <RedirectionContent />
    </Suspense>
  );
}

function RedirectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 컴포넌트가 마운트된 후에 로직이 실행하게 하기 위해 useEffect 훅 사용
  useEffect(() => {
    const type = searchParams.get('type');
    const isSuccess = searchParams.get('is-success');
    const accessToken = searchParams.get('access-token');
    const isGuest = searchParams.get('is-guest');
    const userName = searchParams.get('user-name');
    const profileImageUrl = searchParams.get('profile-image-url');

    console.log('searchParams', searchParams);

    console.log('type', type);
    console.log('isSuccess', isSuccess);
    console.log('accessToken', accessToken);
    console.log('isGuest', isGuest);
    console.log('userName', userName);
    console.log('profileImageUrl', profileImageUrl);

    const jsonToken = JSON.parse(decodeURIComponent(accessToken)).id;
    console.log('jsonToken', jsonToken);
    localStorage.setItem('jsonToken', jsonToken);

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: userName,
          profileImageUrl: profileImageUrl,
        }),
      );

      // HTTP 통신을 위해 인코딩되었던 토큰을 디코딩
      try {
        const decodedToken = JSON.parse(decodeURIComponent(accessToken));
        console.log('Decoded Token:', decodedToken);
      } catch (e) {
        console.error('Token decode error', e);
      }

      // 라우팅 처리
      if (isGuest === 'true') {
        router.push('/sign-up');
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  // TODO : 향후 로딩 페이지로 대체
  return <div>로딩중...</div>;
}
