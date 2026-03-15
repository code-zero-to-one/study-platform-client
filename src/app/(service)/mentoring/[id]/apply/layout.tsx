import type { ReactNode } from 'react';
import { requireAuthenticatedMemberRoute } from '@/features/auth/model/server-route-guard';

export default async function MentoringApplyLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedMemberRoute();

  return <>{children}</>;
}
