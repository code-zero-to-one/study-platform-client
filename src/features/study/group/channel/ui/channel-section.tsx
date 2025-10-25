import Comments from './comment-section';
import Post from './post';
import { Leader } from '../../api/group-study-types';
import { usePostQuery } from '../model/use-channel-query';

interface ChannelSectionProps {
  groupStudyId: number;
  leader: Leader;
}

export default function ChannelSection({
  groupStudyId,
  leader,
}: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);

  if (isLoading) return;

  return (
    <div className="flex flex-col gap-500">
      <Post data={data!} leader={leader} />
      <div>
        <Comments groupStudyId={groupStudyId} />
      </div>
    </div>
  );
}
