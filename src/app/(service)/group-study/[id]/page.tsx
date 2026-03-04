import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getGroupStudyDetailInServer } from '@/api/endpoints/group-study/get-group-study-detail.server';
import { getGroupStudyMyStatusInServer } from '@/api/endpoints/group-study/get-group-study-my-status.server';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import type { GroupStudyFullResponseDto } from '@/api/openapi/models';
import StudyDetailPage from '@/components/pages/group-study-detail-page';
import { GroupStudyDetailResponse } from '@/types/api/group-study.types';
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
        title: '그룹 스터디 - ZERO-ONE',
        description: 'ZERO-ONE 스터디 플랫폼에서 스터디를 둘러보세요.',
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const title = groupStudy.detailInfo?.title || '그룹 스터디';
    const description =
      groupStudy.detailInfo?.description ||
      groupStudy.detailInfo?.summary ||
      'ZERO-ONE 스터디에 참여하세요.';
    const imageUrl =
      groupStudy.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl ||
      '/images/banner.png';

    return {
      title: `${title} | ZERO-ONE 스터디`,
      description,
      keywords: [title, '스터디', '그룹스터디', '협업'].filter(Boolean),
      alternates: {
        canonical: `https://www.zeroone.it.kr/study/${id}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
      openGraph: {
        type: 'website',
        url: `https://www.zeroone.it.kr/study/${id}`,
        title: `${title} | ZERO-ONE 스터디`,
        description,
        siteName: 'ZERO-ONE',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  } catch {
    return {
      title: '그룹 스터디 - ZERO-ONE',
      description: 'ZERO-ONE 스터디 플랫폼에서 스터디를 둘러보세요.',
      robots: {
        index: false,
        follow: false,
      },
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

  // 그룹 스터디 상세 정보 미리 가져오기
  await queryClient.fetchQuery({
    queryKey: ['groupStudyDetail', Number(id)],
    queryFn: () => getGroupStudyDetailInServer({ groupStudyId: Number(id) }),
  });

  const data = queryClient.getQueryData<GroupStudyDetailResponse>([
    'groupStudyDetail',
    Number(id),
  ])!;

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
      <StudyDetailPage memberId={memberId} groupStudyId={Number(id)} />
    </HydrationBoundary>
  );
}
