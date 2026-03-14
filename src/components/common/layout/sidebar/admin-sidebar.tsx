'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/common/ui/avatar';
import TabMenu from '@/components/common/ui/tab-menu';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useUserProfileQuery } from '@/hooks/queries/use-user-profile-query';
import OutIcon from 'public/icons/out.svg';

export default function AdminSideBar() {
  const { memberId } = useAuthReady();
  const { data: profile } = useUserProfileQuery(memberId ?? 0);

  const pathname = usePathname();
  const isSalesManagementPath = pathname.startsWith('/admin/sales-management');
  const isMentoringManagementPath = pathname.startsWith('/admin/mentoring');
  const isMatchingManagementPath = pathname.startsWith('/admin/matching');

  return (
    <aside className="border-border-subtle h-screen w-fit border-r p-200">
      <div className="border-border-subtle flex items-center gap-150 border-b py-200">
        {profile && (
          <UserAvatar
            size={40}
            image={
              profile.memberProfile?.profileImage?.resizedImages[0]
                .resizedImageUrl
            }
          />
        )}

        <div className="w-[136px]">
          <p className="font-designer-14m text-text-default">
            {profile?.memberProfile.memberName}
          </p>
        </div>

        <Link href="/">
          <OutIcon />
        </Link>
      </div>

      <nav className="mt-200 flex w-[188px] flex-col gap-100">
        <Link href="/admin">
          <TabMenu active={pathname === '/admin'}>사용자 관리</TabMenu>
        </Link>

        <Link href="/admin/sales-management/payment-refund">
          <TabMenu active={isSalesManagementPath}>매출 관리</TabMenu>
        </Link>

        <Link href="/admin/mentoring/dashboard">
          <TabMenu active={isMentoringManagementPath}>멘토링 관리</TabMenu>
        </Link>

        <Link href="/admin/matching">
          <TabMenu active={isMatchingManagementPath}>1:1 매칭 관리</TabMenu>
        </Link>
      </nav>
    </aside>
  );
}
