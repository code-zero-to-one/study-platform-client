'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/features/auth/api/auth';
import { cn } from '@/shared/shadcn/lib/utils';
import { deleteCookie } from '@/shared/tanstack-query/cookie';

export default function Sidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      deleteCookie('accessToken');
      deleteCookie('memberId');
      queryClient.clear();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="border-border-subtle box-border flex w-[300px] flex-col gap-150 border-x-1 px-300 pt-500">
      <SidebarItem
        onClick={() => router.push('/my-page')}
        isActive={pathname === '/my-page'}
      >
        프로필
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-study')}
        isActive={pathname === '/my-study'}
      >
        마이스터디
      </SidebarItem>
      <SidebarItem onClick={() => {}} isActive={false}>
        계정설정
      </SidebarItem>
      <div className="bg-border-subtlest h-[1px]" />
      <SidebarItem onClick={handleLogout} isActive={false}>
        로그아웃
      </SidebarItem>
    </div>
  );
}

function SidebarItem({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex py-[14px] pr-[12px] pl-[24px]">
      <div
        onClick={onClick}
        className={cn(
          'font-designer-18m text-text-default cursor-pointer',
          isActive && 'font-designer-18b text-text-default',
        )}
      >
        {children}
      </div>
    </div>
  );
}
