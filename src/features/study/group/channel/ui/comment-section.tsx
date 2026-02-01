import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Comment from './comment';
import CommentInput from './comment-input';
import SubComments from './sub-comments';
import { ThreadReaction } from './thread-reaction';
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

  const [threadText, setThreadText] = useState<string>('');
  const [openThreadId, setOpenThreadId] = useState<number | null>(null); // 👈 변경

  const { mutate: createThread } = usePostThreadMutation();

  const handleThreadSubmit = (groupStudyId: number, content: string) => {
    createThread(
      { groupStudyId, content },
      {
        onSuccess: async () => {
          await threadRefetch();
          setThreadText('');
        },
        onError: console.error,
      },
    );
  };

  if (isLoading) return null; // 👈 안전 반환

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center">
        <MessageCircle className="mr-100 inline-block" size={24} />
        <span className="font-designer-16b text-text-strong mr-50">댓글</span>
        <span className="font-designer-16b text-text-subtlest">
          {data?.length ?? 0}개
        </span>
      </div>

      <div className="flex flex-col gap-300">
        {data?.map((comment) => {
          const isOpen = openThreadId === comment.threadId;
          const toggle = () =>
            setOpenThreadId((prev) =>
              prev === comment.threadId ? null : comment.threadId,
            );

          return (
            <div
              key={comment.threadId}
              className="border-b border-[#D5D7DA] pb-300"
            >
              <div className="flex flex-col gap-200">
                <Comment
                  mode="thread"
                  data={comment}
                  groupStudyId={groupStudyId}
                />
                <div className="flex gap-150">
                  <ThreadReaction
                    groupStudyId={groupStudyId}
                    threadId={comment.threadId}
                    initialReaction={comment.myReaction}
                    initialCounts={{
                      likes: comment.likesCount,
                      dislikes: comment.dislikesCount,
                    }}
                  />
                  <span className="cursor-pointer" onClick={toggle}>
                    답글쓰기
                  </span>
                </div>
              </div>

              <div className="ml-[52px] flex flex-col">
                <SubComments
                  threadId={comment.threadId}
                  groupStudyId={groupStudyId}
                  showInput={isOpen} // 👈 스레드별
                  handleShowInput={toggle} // 👈 스레드별
                />
              </div>
            </div>
          );
        })}

        <CommentInput
          mode="save"
          content={threadText}
          onChange={setThreadText}
          onConfirm={() => handleThreadSubmit(groupStudyId, threadText)}
          onCancel={() => setThreadText('')}
        />
      </div>
    </div>
  );
}
