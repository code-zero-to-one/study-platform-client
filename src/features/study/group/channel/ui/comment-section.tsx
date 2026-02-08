import { useQueries } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/ui/pagination';
import Comment from './comment';
import CommentInput from './comment-input';
import SubComments from './sub-comments';
import { ThreadReaction } from './thread-reaction';
import { getComments } from '../api/get-comments';
import {
  usePostThreadMutation,
  useThreadsQuery,
} from '../model/use-channel-query';

const COMMENTS_PAGE_SIZE = 10;

interface CommentProps {
  groupStudyId: number;
}

export default function CommentSection({ groupStudyId }: CommentProps) {
  const [page, setPage] = useState<number>(1);
  const {
    data,
    isLoading,
    isError,
    refetch: threadRefetch,
  } = useThreadsQuery({ groupStudyId, page, size: COMMENTS_PAGE_SIZE });

  const [threadText, setThreadText] = useState<string>('');
  const [openThreadId, setOpenThreadId] = useState<number | null>(null);

  // 모든 스레드의 답글을 병렬로 조회
  const commentQueries = useQueries({
    queries: (data?.content ?? []).map((thread) => ({
      queryKey: ['comments', groupStudyId, thread.threadId],
      queryFn: () => getComments({ groupStudyId, threadId: thread.threadId }),
      enabled: !!data,
    })),
  });

  // 모든 답글 쿼리 로딩 완료 여부
  const allCommentsLoaded = commentQueries.every((q) => !q.isLoading);

  // 총 댓글 수 (메인 댓글 + 답글)
  const totalReplyCount = commentQueries.reduce(
    (sum, q) => sum + (q.data?.totalElements ?? 0),
    0,
  );

  const totalCommentCount = (data?.totalElements ?? 0) + totalReplyCount;

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

  // threads 로딩 중이거나 답글 로딩 중이면 대기
  if (isLoading || !allCommentsLoaded) return null;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-200 py-400">
        <span className="text-text-subtlest">
          댓글을 불러오는 중 오류가 발생했습니다.
        </span>
        <button
          onClick={() => threadRefetch()}
          className="text-text-accent-blue hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const hasComments = (data?.content?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center">
        <MessageCircle className="mr-100 inline-block" size={24} />
        <span className="font-designer-16b text-text-strong mr-50">댓글</span>
        <span className="font-designer-16b text-text-subtlest">
          {totalCommentCount}개
        </span>
      </div>

      <div className="flex flex-col gap-300">
        {!hasComments && (
          <div className="flex justify-center py-400">
            <span className="text-text-subtlest">
              아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </span>
          </div>
        )}

        {data?.content?.map((comment) => {
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
                  showInput={isOpen}
                  handleShowInput={toggle}
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

        {(data?.totalPages ?? 0) > 1 && (
          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onChangePage={setPage}
            className="mt-400"
          />
        )}
      </div>
    </div>
  );
}
