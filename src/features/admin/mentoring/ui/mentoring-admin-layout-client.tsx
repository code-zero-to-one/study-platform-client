'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import Tabs from '@/components/ui/tabs';
import MentoringSeedButton from '@/features/admin/mentoring/ui/mentoring-seed-button';

const MENTORING_ADMIN_TABS = [
  {
    label: '대시보드',
    value: 'dashboard',
  },
  {
    label: '멘토 심사',
    value: 'mentor-applications',
  },
  {
    label: '멘토 등록 정보',
    value: 'mentor-operations',
  },
  {
    label: '신청/일정 현황',
    value: 'sessions',
  },
] as const;

export default function MentoringAdminLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab =
    MENTORING_ADMIN_TABS.find((tab) => pathname.endsWith(`/${tab.value}`))
      ?.value ?? 'dashboard';

  const handleTabChange = (value: string) => {
    router.push(`/admin/mentoring/${value}`);
  };

  return (
    <div className="flex flex-col gap-200 p-300">
      <div className="flex items-start justify-between gap-150">
        <div className="flex flex-col gap-50">
          <h1 className="font-designer-20b text-text-default">멘토링 관리</h1>
          <p className="font-designer-14r text-text-subtle">
            현재 구현된 멘토링 등록/신청/일정 데이터를 기준으로 심사와 운영
            현황을 관리합니다.
          </p>
        </div>
        <MentoringSeedButton />
      </div>

      <Tabs
        tabs={[...MENTORING_ADMIN_TABS]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {children}
    </div>
  );
}
