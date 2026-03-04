import type { ReactNode } from 'react';
import MentoringAdminLayoutClient from '@/features/admin/mentoring/ui/mentoring-admin-layout-client';

export default function MentoringManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MentoringAdminLayoutClient>{children}</MentoringAdminLayoutClient>;
}
