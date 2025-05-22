'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/shared/shadcn/lib/utils';

export default function Sidebar() {
  const router = useRouter();

  const pathname = usePathname();

  return (
    <div className="box-border flex w-[300px] flex-col gap-[12px] px-[24px] pt-[40px]">
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
      <SidebarItem onClick={() => { }} isActive={false}>
        계정설정
      </SidebarItem>
      <div className="h-[1px] bg-[var(--color-border-subtle)]" />
      <SidebarItem onClick={() => { }} isActive={false}>
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
          'cursor-pointer text-[18px] leading-[29px] font-[500]',
          isActive && 'font-[700]',
        )}
      >
        {children}
      </div>
    </div>
  );
}
