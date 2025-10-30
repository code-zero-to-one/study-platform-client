import Comments from './comment-section';
import CreatePost from './create-post';
import Post from './post';
import PostNotFound from './post-not-found';

import {
  GroupStudyMyStatusResponse,
  Leader,
} from '../../api/group-study-types';
import KickedReasonModal from '../../ui/kicked-reason-modal';

import { usePostQuery } from '../model/use-channel-query';

interface ChannelSectionProps {
  groupStudyId: number;
  leader: Leader;
  memberId: number;
  myApplicationStatus?: GroupStudyMyStatusResponse;
}

export default function ChannelSection({
  groupStudyId,
  leader,
  memberId,
  myApplicationStatus,
}: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);

  if (isLoading) return null;

  // 등록되지 않은 경우
  if (!data?.isRegistered) {
    return memberId === leader.memberId ? (
      <CreatePost groupStudyId={groupStudyId} />
    ) : (
      <PostNotFound />
    );
  }

  // 등록된 경우
  return (
    <>
      <div className="flex flex-col gap-500">
        <Post data={data} leader={leader} />
        <Comments groupStudyId={groupStudyId} />
      </div>

      {myApplicationStatus?.status === 'KICKED' && (
        <KickedReasonModal reason={myApplicationStatus.reason} />
      )}
    </>
  );
}
