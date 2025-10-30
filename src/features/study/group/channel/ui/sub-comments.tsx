import { useState } from 'react';
import Comment from './comment';
import CommentInput from './comment-input';

import { CommentReaction } from './comment-reaction';
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

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-300">
      {data.map((subComment) => (
        <div
          key={subComment.commentId}
          className="flex flex-col gap-200 pt-300"
        >
          <Comment
            data={subComment}
            groupStudyId={groupStudyId}
            mode="comment"
          />
          <CommentReaction
            threadId={threadId}
            commentId={subComment.commentId}
            initialReaction={subComment.myReaction}
            initialCounts={{
              likes: subComment.likesCount,
              dislikes: subComment.dislikesCount,
            }}
          />
        </div>
      ))}

      {showInput && (
        <div className="py-300">
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
              handleShowInput();
            }}
          />
        </div>
      )}
    </div>
  );
}
