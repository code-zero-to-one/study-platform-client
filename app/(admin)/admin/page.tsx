import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { getMemberListInServer } from '@/features/admin/api/member-list.server';
import MemberListTable from '@/features/admin/ui/member-list-table';

export default async function AdminPage() {
  const queryClient = new QueryClient();

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['memberList', null, null, null, 1], // memberList, roleId, memberStatus, searchKeyword, page
    queryFn: () => getMemberListInServer({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-w-[1200px]">
        <aside className="border-border-subtle h-screen w-fit border-r p-200">
          <div className="border-border-subtle flex items-center gap-150 border-b py-200">
            <Image
              src="icons/book.svg"
              width={40}
              height={40}
              alt="admin-image"
              className="rounded-full"
            />

            <div className="w-[136px]">
              <p className="font-designer-14m text-text-default">관리자</p>
              <p className="font-designer-12r text-text-subtle">
                kimkim@gmail.com
              </p>
            </div>

            <Image src="icons/logout.svg" width={16} height={16} alt="logout" />
          </div>

          <nav className="mt-200">
            <Link
              href="/admin"
              className="bg-background-accent-blue-strong text-text-inverse font-designer-14m rounded-100 inline-block w-full px-200 py-150"
            >
              사용자 관리
            </Link>
          </nav>
        </aside>

        <div className="flex-1 p-300">
          <MemberListTable />
        </div>
      </div>
    </HydrationBoundary>
  );
}
