'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { hashValue } from '@/shared/lib/hash';
import { deleteCookie, getCookie } from '@/shared/tanstack-query/cookie';
import UserAvatar from '@/shared/ui/avatar';
import { HeaderDropdown } from '@/shared/ui/dropdown';
import { logout } from '../api/auth';

export default function HeaderUserDropdown({ userImg }: { userImg: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. 서버에 로그아웃 요청 (refresh token 삭제)
      await logout();

      const memberId = getCookie('memberId');
      sendGTMEvent({
        event: 'custom_member_logout',
        dl_timestamp: new Date().toISOString(),
        dl_member_id: hashValue(memberId),
      });

      // 2. 클라이언트의 access token 삭제
      deleteCookie('accessToken');
      deleteCookie('memberId');

      // 3. React Query 캐시 초기화
      queryClient.clear();

      // 4. 홈으로 리다이렉트
      router.push('/');
      router.refresh(); // 전체 페이지 리프레시
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <HeaderDropdown
      placeholder={
        <UserAvatar
          image={
            userImg
            // memberInfo.data?.content?.memberProfile?.profileImage
            //   ?.resizedImages[0]?.resizedImageUrl || 'profile-default.svg'
          }
        />
      }
      options={[
        {
          label: '내 정보 수정',
          value: '/my-page',
        },
        {
          label: '로그아웃',
          value: 'logout',
        },
      ]}
      onChange={async (value) => {
        if (value === '/my-page') {
          await router.push(value);
        } else if (value === 'logout') {
          await handleLogout();
        }
      }}
    />
  );
}
