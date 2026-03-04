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

      <nav className="mt-200">
        <TabMenu active={pathname === '/admin'}>
          <Link href="/admin">사용자 관리</Link>
        </TabMenu>

        <TabMenu
          active={
            pathname === '/admin/sales-management/payment-refund' ||
            pathname === '/admin/sales-management/settlement'
          }
        >
          <Link href="/admin/sales-management/payment-refund">매출 관리</Link>
        </TabMenu>
      </nav>
    </aside>
  );
}
