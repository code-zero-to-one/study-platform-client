'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import TabMenu from '@/shared/ui/tab-menu';

interface AdminDetailSideBarProps {
  memberId: string;
}

export default function AdminDetailSideBar({
  memberId,
}: AdminDetailSideBarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-border-default rounded-100 flex h-fit w-[188px] flex-col border p-200">
      <Link href={`/admin/detail/${memberId}/profile`}>
        <TabMenu active={pathname === `/admin/detail/${memberId}/profile`}>
          프로필
        </TabMenu>
      </Link>

      <Link href={`/admin/detail/${memberId}/account-history`}>
        <TabMenu
          active={pathname === `/admin/detail/${memberId}/account-history`}
        >
          계정 이력
        </TabMenu>
      </Link>

      <Link href={`/admin/detail/${memberId}/study`}>
        <TabMenu active={pathname === `/admin/detail/${memberId}/study`}>
          스터디
        </TabMenu>
      </Link>

      <Link href={`/admin/detail/${memberId}/sincerity-temp`}>
        <TabMenu
          active={pathname === `/admin/detail/${memberId}/sincerity-temp`}
        >
          성실온도
        </TabMenu>
      </Link>
    </nav>
  );
}
