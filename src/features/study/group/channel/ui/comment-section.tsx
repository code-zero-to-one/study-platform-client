import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Comment from './comment';
import CommentInput from './comment-input';
import Reaction from './reaction';
import SubComments from './sub-comments';
import {
  usePostThreadMutation,
  useThreadsQuery,
} from '../model/use-channel-query';

interface CommentProps {
  groupStudyId: number;
}

export default function CommentSection({ groupStudyId }: CommentProps) {
  const {
    data,
    isLoading,
    refetch: threadRefetch,
  } = useThreadsQuery(groupStudyId);
  const [threadText, setThreadText] = useState('');

  const [showSubCommentInput, setShowSubCommentInput] = useState(false);

  const { mutate: createThread } = usePostThreadMutation();

  const handleThreadSubmit = (groupStudyId: number, content: string) => {
    createThread(
      { groupStudyId, content },
      {
        onSuccess: async () => {
          await threadRefetch();
          console.log('성공');
          // 폼 리셋/알림 등
        },
        onError: (err) => {
          console.error(err);
        },
      },
    );
  };

  if (isLoading) {
    return;
  }

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center">
        <MessageCircle className="mr-100 inline-block" size={24} />
        <span className="font-designer-16b text-text-strong mr-50">댓글</span>
        <span className="font-designer-16b text-text-subtlest">
          {data.length}개
        </span>
      </div>
      <div className="flex flex-col gap-300">
        {data.map((comment) => (
          <div
            key={comment.threadId}
            className="border-b-[1px] border-[#D5D7DA] pb-300"
          >
            <div className="flex flex-col gap-200">
              <Comment data={comment} groupStudyId={groupStudyId} />
              <div className="flex gap-150">
                <Reaction
                  likesCount={comment.likesCount}
                  dislikesCount={comment.dislikesCount}
                  myReaction={comment.myReaction}
                />
                <span
                  onClick={() => setShowSubCommentInput(!showSubCommentInput)}
                >
                  답글쓰기
                </span>
              </div>
            </div>

            <div className="ml-[52px] flex flex-col">
              <SubComments
                threadId={comment.threadId}
                groupStudyId={groupStudyId}
                showInput={showSubCommentInput}
                handleShowInput={() =>
                  setShowSubCommentInput(!showSubCommentInput)
                }
              />
            </div>
          </div>
        ))}

        <CommentInput
          mode="save"
          content={threadText}
          onChange={(value) => setThreadText(value)}
          onConfirm={() => {
            handleThreadSubmit(groupStudyId, threadText);
            setThreadText('');
          }}
          onCancel={() => setThreadText('')}
        />
      </div>
    </div>
  );
}
