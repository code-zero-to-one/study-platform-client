'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { hashValue } from '@/shared/lib/hash';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';
import { deleteCookie, getCookie } from '@/shared/tanstack-query/cookie';
import UserAvatar from '@/shared/ui/avatar';
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
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div>
          <UserAvatar image={userImg} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {[
          {
            label: '내 정보 수정',
            value: '/my-page',
            onMenuClick: () => router.push('/my-page'),
          },
          {
            label: '로그아웃',
            value: 'logout',
            onMenuClick: handleLogout,
          },
        ].map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={option.onMenuClick}
            className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
          >
            <span className="font-designer-14m text-text-subtle">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
