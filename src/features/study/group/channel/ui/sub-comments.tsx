import Comment from './comment';
import Reaction from './reaction';
import { useCommentsQuery } from '../model/use-channel-query';

interface SubCommentsProps {
  threadId: number;
  groupStudyId: number;
}

export default function SubComments({
  threadId,
  groupStudyId,
}: SubCommentsProps) {
  const { data, isLoading } = useCommentsQuery(groupStudyId, threadId);

  if (isLoading) return;

  return (
    <div className="flex flex-col gap-300 py-300">
      {data.map((subComment) => (
        <div key={subComment.authorId} className="flex flex-col gap-200">
          <Comment data={subComment} />
          <Reaction
            likesCount={subComment.likesCount}
            dislikesCount={subComment.dislikesCount}
            myReaction={subComment.myReaction}
          />
        </div>
      ))}
      {/* <input /> */}
    </div>
  );
}
