import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getGroupStudyDetailInServer } from '@/features/study/group/api/get-group-study-detail.server';
import { getGroupStudyMyStatusInServer } from '@/features/study/group/api/get-group-study-my-status.server';
import { GroupStudyDetailResponse } from '@/features/study/group/api/group-study-types';
import StudyDetailPage from '@/features/study/group/ui/group-study-detail-page';
import { getServerCookie } from '@/utils/server-cookie';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();

  // 그룹 스터디 상세 정보 미리 가져오기
  await queryClient.fetchQuery({
    queryKey: ['groupStudyDetail', Number(id)],
    queryFn: () => getGroupStudyDetailInServer({ groupStudyId: Number(id) }),
  });

  const data: GroupStudyDetailResponse = queryClient.getQueryData([
    'groupStudyDetail',
    Number(id),
  ]);

  const memberIdStr = await getServerCookie('memberId');
  const memberId = memberIdStr ? Number(memberIdStr) : undefined;

  const isLeader = data.basicInfo.leader.memberId === memberId;

  if (!isLeader && memberId) {
    // 내가 리더가 아닐 경우에만 내 신청 상태 정보 미리 가져오기
    await queryClient.prefetchQuery({
      queryKey: ['groupStudyMyStatus', Number(id)],
      queryFn: () =>
        getGroupStudyMyStatusInServer({ groupStudyId: Number(id) }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudyDetailPage
        memberId={memberId}
        groupStudyId={Number(id)}
        // studyDetail={data}
        // leader={data.basicInfo.leader}
      />
    </HydrationBoundary>
  );
}
