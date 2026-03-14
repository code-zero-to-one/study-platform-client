'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useLogoutMutation } from '@/hooks/queries/use-auth-mutation';
import { useUserProfileQuery } from '@/hooks/queries/use-user-profile-query';

const MY_PAGE_ROUTES = [
  { href: '/my-page', label: '프로필' },
  { href: '/notification', label: '알림' },
  { href: '/my-activity', label: '내 활동' },
  { href: '/my-study', label: '마이스터디' },
  { href: '/my-study-review', label: '스터디 후기' },
  { href: '/my-mentoring', label: '나의 멘토링' },
  { href: '/mentoring-management', label: '멘토 운영 관리' },
  { href: '/payment-management', label: '결제 관리' },
] as const;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { memberId } = useAuthReady();
  const { mutateAsync: logout } = useLogoutMutation();

  const { data: profile } = useUserProfileQuery(memberId ?? 0);

  const sidebarRoutes = useMemo(() => {
    return profile?.premiumCreator
      ? [
          ...MY_PAGE_ROUTES,
          { href: '/settlement-management', label: '정산 관리' as const },
        ]
      : MY_PAGE_ROUTES;
  }, [profile?.premiumCreator]);

  useEffect(() => {
    sidebarRoutes.forEach((route) => {
      router.prefetch(route.href);
    });
  }, [router, sidebarRoutes]);

  const handleLogout = async () => {
    await logout();
  };

  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="border-border-subtle box-border hidden w-[300px] flex-col gap-150 border-x-1 px-300 pt-500 lg:flex">
      {sidebarRoutes.map((route) => (
        <SidebarLinkItem
          key={route.href}
          href={route.href}
          isActive={isActivePath(route.href)}
        >
          {route.label}
        </SidebarLinkItem>
      ))}
      <div className="bg-border-subtlest h-[1px]" />
      <SidebarActionItem onClick={handleLogout}>
        로그아웃
      </SidebarActionItem>
    </div>
  );
}

function SidebarLinkItem({
  children,
  href,
  isActive,
}: {
  children: React.ReactNode;
  href: string;
  isActive: boolean;
}) {
  return (
    <div className="flex py-[14px] pr-[12px] pl-[24px]">
      <Link
        href={href}
        prefetch
        className={cn(
          'font-designer-18m text-text-default cursor-pointer',
          isActive && 'font-designer-18b text-text-default',
        )}
      >
        {children}
      </Link>
    </div>
  );
}

function SidebarActionItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="flex py-[14px] pr-[12px] pl-[24px]">
      <button
        type="button"
        onClick={onClick}
        className="font-designer-18m text-text-default cursor-pointer"
      >
        {children}
      </button>
    </div>
  );
}
