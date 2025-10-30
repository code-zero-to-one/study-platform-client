import Comments from './comment-section';
import CreatePost from './create-post';
import Post from './post';
import PostNotFound from './post-not-found';
import { Leader } from '../../api/group-study-types';
import { usePostQuery } from '../model/use-channel-query';

interface ChannelSectionProps {
  groupStudyId: number;
  leader: Leader;
  memberId: number;
}

export default function ChannelSection({
  groupStudyId,
  leader,
  memberId,
}: ChannelSectionProps) {
  const { data, isLoading } = usePostQuery(groupStudyId);

  console.log('data', data);

  if (isLoading) return;

  return !data.isRegistered ? (
    memberId === leader.memberId ? (
      <CreatePost />
    ) : (
      <PostNotFound />
    )
  ) : (
    <div className="flex flex-col gap-500">
      <Post data={data!} leader={leader} />
      <div>
        <Comments groupStudyId={groupStudyId} />
      </div>
    </div>
  );
}
