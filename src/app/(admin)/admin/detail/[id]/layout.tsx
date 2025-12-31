import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import AdminDetailSideBar from '@/components/layout/sidebar/admin-detail-sidebar';

export default async function AdminDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: memberId } = await params;

  return (
    <div>
      <header className="mb-300 flex items-center gap-200">
        <Link href="/admin">
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-bold-h4">사용자 상세 정보</h1>
      </header>

      <div className="flex gap-200">
        <AdminDetailSideBar memberId={memberId} />

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
