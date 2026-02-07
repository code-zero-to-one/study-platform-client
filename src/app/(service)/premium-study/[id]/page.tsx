import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import type { GroupStudyFullResponseDto } from '@/api/openapi/models';
import PremiumStudyDetailPage from '@/components/pages/premium-study-detail-page';
import { getGroupStudyDetailInServer } from '@/features/study/group/api/get-group-study-detail.server';
import { getGroupStudyMyStatusInServer } from '@/features/study/group/api/get-group-study-my-status.server';
import { GroupStudyDetailResponse } from '@/features/study/group/api/group-study-types';
import { getServerCookie } from '@/utils/server-cookie';

interface Props {
  params: Promise<{ id: string }>;
}

interface GroupStudyResponse {
  content?: GroupStudyFullResponseDto;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const config = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    const groupStudyApi = new GroupStudyManagementApi(config, config.basePath);

    const response = await groupStudyApi.getGroupStudy(Number(id));
    const groupStudy = (response.data as GroupStudyResponse)?.content;

    if (!groupStudy) {
      return {
        title: '멘토 스터디 - 제로원',
        description: '제로원 스터디 플랫폼에서 멘토 스터디를 둘러보세요.',
      };
    }

    const title = groupStudy.detailInfo?.title || '멘토 스터디';
    const description =
      groupStudy.detailInfo?.description ||
      groupStudy.detailInfo?.summary ||
      '제로원 멘토 스터디에 참여하세요.';

    return {
      title: `${title} - 제로원 멘토스터디`,
      description,
      openGraph: {
        title: `${title} - 제로원 멘토스터디`,
        description,
        images: groupStudy.detailInfo?.image?.resizedImages?.[0]
          ?.resizedImageUrl
          ? [groupStudy.detailInfo.image.resizedImages[0].resizedImageUrl]
          : [],
      },
    };
  } catch {
    return {
      title: '멘토 스터디 - 제로원',
      description: '제로원 스터디 플랫폼에서 멘토 스터디를 둘러보세요.',
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();

  // 프리미엄 스터디 상세 정보 미리 가져오기
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

  const isLeader = data?.basicInfo?.leader?.memberId === memberId;

  // 프로토타입 id=2가 아닐 때만 API로 신청 상태 조회 (목데이터 스터디는 스킵)
  if (data && Number(id) !== 2 && !isLeader && memberId) {
    await queryClient.prefetchQuery({
      queryKey: ['groupStudyMyStatus', Number(id)],
      queryFn: () =>
        getGroupStudyMyStatusInServer({ groupStudyId: Number(id) }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PremiumStudyDetailPage memberId={memberId} groupStudyId={Number(id)} />
    </HydrationBoundary>
  );
}
