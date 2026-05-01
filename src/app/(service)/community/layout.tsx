import { type ReactNode } from 'react';
import { CommunitySidebar } from '@/components/pages/community/_components/community-sidebar';

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full">
      <CommunitySidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
