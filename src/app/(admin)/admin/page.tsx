import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getMemberListInServer } from '@/api/endpoints/admin/member-list.server';
import MemberListTable from '@/components/admin/member-list-table';

export default async function AdminPage() {
  const queryClient = new QueryClient();

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['memberList', null, null, '', 1], // memberList, roleId, memberStatus, searchKeyword, page
    queryFn: () => getMemberListInServer({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemberListTable />
    </HydrationBoundary>
  );
}
