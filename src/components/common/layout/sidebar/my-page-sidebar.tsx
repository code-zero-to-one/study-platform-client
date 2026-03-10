'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuthReady } from '@/hooks/common/use-auth';
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

  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="border-border-subtle box-border flex w-[300px] flex-col gap-150 border-x-1 px-300 pt-500">
      <SidebarItem
        onClick={() => router.push('/my-page')}
        isActive={isActivePath('/my-page')}
      >
        프로필
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/notification')}
        isActive={isActivePath('/notification')}
      >
        알림
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-activity')}
        isActive={isActivePath('/my-activity')}
      >
        내 활동
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-study')}
        isActive={isActivePath('/my-study')}
      >
        마이스터디
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-study-review')}
        isActive={isActivePath('/my-study-review')}
      >
        스터디 후기
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/my-mentoring')}
        isActive={isActivePath('/my-mentoring')}
      >
        나의 멘토링
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/note-consultation')}
        isActive={isActivePath('/note-consultation')}
      >
        쪽지 상담
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/mentoring-management')}
        isActive={isActivePath('/mentoring-management')}
      >
        멘토링 관리
      </SidebarItem>
      <SidebarItem
        onClick={() => router.push('/payment-management')}
        isActive={isActivePath('/payment-management')}
      >
        결제 관리
      </SidebarItem>
      {profile?.premiumCreator && (
        <SidebarItem
          onClick={() => router.push('/settlement-management')}
          isActive={isActivePath('/settlement-management')}
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
