import React from 'react';
import { DiscussionComment } from '@/types/discussion';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface CommentListProps {
  comments: DiscussionComment[];
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
}

export default function CommentList({ comments, onDelete, onEdit }: CommentListProps) {
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  if (comments.length === 0) {
    return (
      <div className="py-800 text-center">
        <p className="font-designer-14r text-text-subtlest">아직 댓글이 없습니다.</p>
        <p className="font-designer-13r text-text-subtlest">첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-200">
      {comments.map((comment) => {
        const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
          locale: ko,
        });

        return (
          <div
            key={comment.id}
            className="rounded-100 border border-border-subtle bg-background-default p-300 transition-colors hover:border-border-brand"
          >
            <div className="mb-100 flex items-start justify-between">
              {/* 작성자 정보 */}
              <div className="flex items-center gap-150">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-neutral-strong-default text-xs font-bold text-text-inverse">
                  {comment.author.nickname.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-designer-13b text-text-strong">
                    {comment.author.nickname}
                  </span>
                  <span className="font-designer-11r text-text-subtlest">{timeAgo}</span>
                </div>
              </div>

              {/* 더보기 메뉴 (본인 댓글만) */}
              {comment.isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                    className="rounded-100 p-100 text-text-subtle transition-colors hover:bg-fill-neutral-subtle-hover hover:text-text-strong"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === comment.id && (
                    <>
                      {/* 백드롭 */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      ></div>

                      {/* 메뉴 */}
                      <div className="absolute right-0 top-full z-20 mt-50 min-w-[120px] rounded-100 border border-border-subtle bg-background-default shadow-3">
                        <button
                          onClick={() => {
                            onEdit?.(comment.id, comment.content);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-150 px-300 py-200 font-designer-13r text-text-default transition-colors hover:bg-fill-neutral-subtle-hover"
                        >
                          <Edit className="h-4 w-4" />
                          수정
                        </button>
                        <button
                          onClick={() => {
                            onDelete?.(comment.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-150 px-300 py-200 font-designer-13r text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 댓글 내용 */}
            <p className="whitespace-pre-wrap font-designer-14r leading-relaxed text-text-default">
              {comment.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
