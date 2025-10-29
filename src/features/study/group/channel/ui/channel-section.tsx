import Comments from './comment-section';
import Post from './post';
import {
  GroupStudyMyStatusResponse,
  Leader,
} from '../../api/group-study-types';
import KickedReasonModal from '../../ui/kicked-reason-modal';
import { usePostQuery } from '../model/use-channel-query';

interface ChannelSectionProps {
  groupStudyId: number;
  leader: Leader;
  myApplicationStatus?: GroupStudyMyStatusResponse;
}

export default function ChannelSection({
  groupStudyId,
  leader,
  myApplicationStatus,
}: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);

  if (isLoading) return;

  return (
    <>
      <div className="flex flex-col gap-500">
        <Post data={data!} leader={leader} />
        <div>
          <Comments groupStudyId={groupStudyId} />
        </div>
      </div>

      {myApplicationStatus?.status === 'KICKED' && (
        <KickedReasonModal reason={myApplicationStatus.reason} />
      )}
    </>
  );
}
