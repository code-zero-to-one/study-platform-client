'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useLogoutMutation } from '@/hooks/queries/use-auth-mutation';
import { useUserProfileQuery } from '@/hooks/queries/use-user-profile-query';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { memberId } = useAuthReady();
  const { mutateAsync: logout } = useLogoutMutation();

  const { data: profile } = useUserProfileQuery(memberId ?? 0);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="border-border-subtle box-border hidden w-[300px] flex-col gap-150 border-x-1 px-300 pt-500 lg:flex">
      <SidebarItem
        onClick={() => router.push('/my-page')}
        isActive={pathname === '/my-page'}
      >
        프로필
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/notification')}
        isActive={pathname === '/notification'}
      >
        알림
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-activity')}
        isActive={pathname === '/my-activity'}
      >
        내 활동
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-study')}
        isActive={pathname === '/my-study'}
      >
        마이스터디
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-study-review')}
        isActive={pathname === '/my-study-review'}
      >
        스터디 후기
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/payment-management')}
        isActive={pathname === '/payment-management'}
      >
        결제 관리
      </SidebarItem>
      {profile?.premiumCreator && (
        <SidebarItem
          onClick={() => router.push('/settlement-management')}
          isActive={pathname === '/settlement-management'}
        >
          정산 관리
        </SidebarItem>
      )}
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
