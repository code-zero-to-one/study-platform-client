'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';

interface ClassSubItem {
  label: string;
  path: string;
}

const CLASS_SUB_ITEMS: ClassSubItem[] = [
  {
    label: '매일 학습 알림톡 시간 수정',
    path: '/my-class/notification-time',
  },
  {
    label: '내 빌더 피드 모아보기',
    path: '/my-class/my-builder-feed',
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { memberId } = useAuthReady();
  const { mutateAsync: logout } = useLogoutMutation();
  const { data: profile } = useUserProfileQuery(memberId ?? 0);

  const isMyClassActive = pathname.startsWith('/my-class');
  const [classOpen, setClassOpen] = useState<boolean>(isMyClassActive);

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
        isActive={pathname.startsWith('/my-study-review')}
      >
        스터디 후기
      </SidebarItem>

      <ExpandableSidebarItem
        label="나의 클래스"
        isActive={pathname === '/my-class'}
        isAnyActive={isMyClassActive}
        isOpen={classOpen}
        onMainClick={() => {
          setClassOpen((prev) => !prev || pathname !== '/my-class');
          router.push('/my-class');
        }}
      >
        {CLASS_SUB_ITEMS.map((item) => (
          <SidebarSubItem
            key={item.path}
            isActive={pathname === item.path}
            onClick={() => router.push(item.path)}
          >
            {item.label}
          </SidebarSubItem>
        ))}
      </ExpandableSidebarItem>

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
    <div className="flex py-[14px] pr-150 pl-150">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'font-designer-18m text-text-default cursor-pointer',
          isActive && 'font-designer-18b text-text-default',
        )}
      >
        {children}
      </button>
    </div>
  );
}

function ExpandableSidebarItem({
  label,
  isActive,
  isAnyActive,
  isOpen,
  onMainClick,
  children,
}: {
  label: string;
  isActive: boolean;
  isAnyActive: boolean;
  isOpen: boolean;
  onMainClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-[14px] pr-150 pl-150">
        <button
          type="button"
          onClick={onMainClick}
          className={cn(
            'font-designer-18m text-text-default cursor-pointer text-left flex-1',
            (isActive || isAnyActive) && 'font-designer-18b text-text-default',
          )}
        >
          {label}
        </button>
        <span
          aria-hidden="true"
          className={cn(
            'inline-block transition-transform text-text-subtle',
            isOpen ? 'rotate-90' : 'rotate-0',
          )}
        >
          ›
        </span>
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-50 pb-100 pl-300">{children}</div>
      ) : null}
    </div>
  );
}

function SidebarSubItem({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-designer-15m text-text-subtle cursor-pointer text-left py-100 pr-150 pl-150 rounded-75 transition-colors',
        isActive
          ? 'font-designer-15b text-text-brand bg-fill-brand-subtle-default'
          : 'hover:bg-fill-neutral-subtle-hover hover:text-text-default',
      )}
    >
      {children}
    </button>
  );
}
