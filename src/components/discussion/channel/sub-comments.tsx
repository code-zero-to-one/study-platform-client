import { useState } from 'react';
import Button from '@/components/common/ui/button';
import {
  useCommentsQuery,
  usePostCommentMutation,
} from '@/hooks/queries/group-study/use-channel-query';
import Comment from './comment';
import CommentInput from './comment-input';

import { CommentReaction } from './comment-reaction';

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
    isError,
    refetch: commentsRefetch,
  } = useCommentsQuery(groupStudyId, threadId);

  // console.log(data, 'subcomment');

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

  if (isError) {
    return (
      <div className="flex items-center gap-100 py-200">
        <span className="text-text-subtlest text-sm">
          답글을 불러오지 못했습니다.
        </span>
        <Button
          size="small"
          color="outlined"
          onClick={() => commentsRefetch()}
          className="text-text-accent-blue font-designer-14r text-sm hover:underline"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-300">
      {data?.content?.map((subComment) => (
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
