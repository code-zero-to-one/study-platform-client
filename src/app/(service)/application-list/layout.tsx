import type { ReactNode } from 'react';
import { requireAuthenticatedMemberRoute } from '@/features/auth/model/server-route-guard';

export default async function ApplicationListLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedMemberRoute();

  return <>{children}</>;
}
