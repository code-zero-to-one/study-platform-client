'use client';

import { useRouter, usePathname } from 'next/navigation';
import React from 'react';
import Tabs from '@/components/ui/tabs';

export default function SalesManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: '결제 및 환불', value: 'payment-refund' },
    { label: '정산', value: 'settlement' },
  ];

  const activeTab = pathname.includes('settlement')
    ? 'settlement'
    : 'payment-refund';

  const handleTabChange = (value: string) => {
    router.push(`/admin/sales-management/${value}`);
  };

  return (
    <div className="flex flex-col gap-200 p-300">
      <div className="font-designer-20b text-text-default">매출 관리</div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {children}
    </div>
  );
}
