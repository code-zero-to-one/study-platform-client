import { set } from 'date-fns';
import { useState } from 'react';
import Comment from './comment';
import CommentInput from './comment-input';
import Reaction from './reaction';
import {
  useCommentsQuery,
  usePostCommentMutation,
} from '../model/use-channel-query';

interface SubCommentsProps {
  threadId: number;
  groupStudyId: number;
  showInput: boolean;
  handleShowInput: () => void;
}

export default function SubComments({
  threadId,
  groupStudyId,
  showInput,
  handleShowInput,
}: SubCommentsProps) {
  const {
    data,
    isLoading,
    refetch: commentsRefetch,
  } = useCommentsQuery(groupStudyId, threadId);

  const [commentText, setCommentText] = useState('');

  const { mutate: createComment } = usePostCommentMutation();

  const handleCommentSubmit = (groupStudyId: number, content: string) => {
    createComment(
      { groupStudyId, content, threadId },
      {
        onSuccess: async () => {
          await commentsRefetch();
          // 폼 리셋/알림 등
        },
        onError: (err) => {
          console.error(err);
        },
      },
    );
  };

  if (isLoading) return;

  return (
    <div className="flex flex-col gap-300 py-300">
      {data.map((subComment) => (
        <div key={subComment.authorId} className="flex flex-col gap-200">
          <Comment
            data={subComment}
            groupStudyId={groupStudyId}
            mode="comment"
          />
          <Reaction
            likesCount={subComment.likesCount}
            dislikesCount={subComment.dislikesCount}
            myReaction={subComment.myReaction}
          />
        </div>
      ))}
      {showInput && (
        <CommentInput
          mode="save"
          content={commentText}
          onChange={(value) => setCommentText(value)}
          onCancel={() => {
            setCommentText('');
            handleShowInput();
          }}
          onConfirm={() => {
            handleCommentSubmit(groupStudyId, commentText);
            setCommentText('');
          }}
        />
      )}
    </div>
  );
}
