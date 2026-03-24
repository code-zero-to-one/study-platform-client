import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import MentoringAdminLayoutClient from '@/features/admin/mentoring/ui/mentoring-admin-layout-client';
import { isMentoringAdminMockEnabled } from '@/features/mentoring/model/mentoring-feature-flag';

export default function MentoringManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!isMentoringAdminMockEnabled()) {
    // 관리자 멘토링 백오피스는 현재 제품 범위에 포함되지 않아 라우트 자체를 숨깁니다.
    notFound();
  }

  return <MentoringAdminLayoutClient>{children}</MentoringAdminLayoutClient>;
}
