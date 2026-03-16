import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGroupStudyDetailInServer } from '@/api/endpoints/group-study/get-group-study-detail.server';
import { getGroupStudyMyStatusInServer } from '@/api/endpoints/group-study/get-group-study-my-status.server';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import type { GroupStudyFullResponseDto } from '@/api/openapi/models';
import PremiumStudyDetailPage from '@/components/pages/premium-study-detail-page';
import { readAuthenticatedMemberId } from '@/features/auth/model/server-auth-session';
import { GroupStudyDetailResponse } from '@/types/api/group-study.types';

interface Props {
  params: Promise<{ id: string }>;
}

interface GroupStudyResponse {
  content?: GroupStudyFullResponseDto;
}

const FALLBACK_METADATA: Metadata = {
  title: '멘토 스터디 - 제로원',
  description: '제로원 스터디 플랫폼에서 멘토 스터디를 둘러보세요.',
};

const parseGroupStudyId = (value: string): number | undefined => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const groupStudyId = parseGroupStudyId(id);

  if (!groupStudyId) {
    return FALLBACK_METADATA;
  }

  try {
    const config = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    const groupStudyApi = new GroupStudyManagementApi(config, config.basePath);

    const response = await groupStudyApi.getGroupStudy(groupStudyId);
    const groupStudy = (response.data as GroupStudyResponse)?.content;

    if (!groupStudy) {
      return FALLBACK_METADATA;
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
    return FALLBACK_METADATA;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const groupStudyId = parseGroupStudyId(id);

  if (!groupStudyId) {
    notFound();
  }

  const queryClient = new QueryClient();

  // 프리미엄 스터디 상세 정보 미리 가져오기
  await queryClient.fetchQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: () => getGroupStudyDetailInServer({ groupStudyId }),
  });

  const data = queryClient.getQueryData<GroupStudyDetailResponse>([
    'groupStudyDetail',
    groupStudyId,
  ]);

  if (!data) {
    notFound();
  }

  const memberId = await readAuthenticatedMemberId();

  const isLeader = data.basicInfo.leader.memberId === memberId;

  if (!isLeader && memberId) {
    // 내가 리더가 아닐 경우에만 내 신청 상태 정보 미리 가져오기
    await queryClient.prefetchQuery({
      queryKey: ['groupStudyMemberStatus', groupStudyId],
      queryFn: () => getGroupStudyMyStatusInServer({ groupStudyId }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PremiumStudyDetailPage memberId={memberId} groupStudyId={groupStudyId} />
    </HydrationBoundary>
  );
}
