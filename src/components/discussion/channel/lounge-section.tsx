import dynamic from 'next/dynamic';
import { GetGroupStudyMemberStatusResponseContent } from '@/api/openapi';
import PageContainer from '@/components/common/layout/page-container';
import { usePostQuery } from '@/hooks/queries/group-study/use-channel-query';
import { useLeaderStore } from '@/stores/useLeaderStore';
import Comments from './comment-section';
import CreatePost from './create-post';
import Post from './post';
import PostNotFound from './post-not-found';

const KickedReasonModal = dynamic(
  () => import('@/components/common/modals/kicked-reason-modal'),
);

interface ChannelSectionProps {
  groupStudyId: number;
  memberId: number;
  myApplicationStatus?: GetGroupStudyMemberStatusResponseContent;
}

export default function LoungeSection({
  groupStudyId,
  memberId,
  myApplicationStatus,
}: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);
  const leader = useLeaderStore((state) => state.leaderInfo);

  if (isLoading) return null;

  // 등록되지 않은 경우
  if (!data?.isRegistered) {
    return memberId === leader?.memberId ? (
      <CreatePost groupStudyId={groupStudyId} />
    ) : (
      <PostNotFound />
    );
  }

  // 등록된 경우
  return (
    <PageContainer className="py-500">
      <div className="flex flex-col gap-500">
        <Post data={data} />
        <Comments groupStudyId={groupStudyId} />
      </div>

      {myApplicationStatus?.status === 'KICKED' && (
        <KickedReasonModal reason={myApplicationStatus.reason} />
      )}
    </PageContainer>
  );
}
