import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MoreVertical, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import CommentForm from '@/features/study/one-to-one/discussion/ui/comment-form';
import type {
  BalanceGameAuthor,
  BalanceGameComment,
} from '@/types/one-to-one-study/balance-game';
import type {
  DiscussionAuthor,
  DiscussionComment,
} from '@/types/one-to-one-study/discussion';
import type {
  VotingAuthor,
  VotingComment,
  VotingOption,
} from '@/types/one-to-one-study/voting';
import type { CommentFormData } from '@/types/schemas/zod-schema';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface CommentListBaseProps {
  comments: (DiscussionComment | VotingComment | BalanceGameComment)[];
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
  votingOptions?: VotingOption[]; // 투표 옵션 목록 (색상 매칭용)
  editingCommentId?: undefined;
}

type CommentListEditingProps = Omit<
  CommentListBaseProps,
  'editingCommentId'
> & {
  editingCommentId: number;
  editingCommentContent: string;
  onUpdateComment: (data: CommentFormData) => void | Promise<void>;
  onCancelEdit: () => void;
};

type CommentListProps = CommentListBaseProps | CommentListEditingProps;

function getAuthorImageUrl(
  author: DiscussionAuthor | VotingAuthor | BalanceGameAuthor,
): string | undefined {
  // profileImage는 BalanceGameAuthor에만 있는 required 필드
  if ('profileImage' in author) {
    if (typeof author.profileImage === 'string') {
      return author.profileImage ?? undefined;
    }

    return author.profileImage?.resizedImages?.[0]?.resizedImageUrl;
  }

  return author.avatar;
}

// 옵션별 색상 정의
const OPTION_BADGE_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-500' },
  { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-500' },
  { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-500' },
  { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
  { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'text-pink-500' },
];

function isEditingMode(p: CommentListProps): p is CommentListEditingProps {
  return p.editingCommentId !== undefined;
}

export default function CommentList(props: CommentListProps) {
  const { comments, onDelete, onEdit, votingOptions, editingCommentId } = props;
  const editingState = isEditingMode(props) ? props : null;
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  if (comments.length === 0) {
    return (
      <div className="py-800 text-center">
        <p className="font-designer-14r text-text-subtlest">
          아직 댓글이 없습니다.
        </p>
        <p className="font-designer-13r text-text-subtlest">
          첫 번째 댓글을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-200">
      {comments.map((comment) => {
        const isEditing = editingCommentId === comment.id;
        const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
          locale: ko,
        });

        // VotingComment 타입인지 확인
        const votedOption =
          'votedOption' in comment ? comment.votedOption : undefined;

        // 투표 옵션의 색상 찾기
        let optionColor = {
          bg: 'bg-fill-brand-subtle-default',
          text: 'text-text-brand',
          icon: 'text-text-brand',
        };
        if (votedOption && votingOptions) {
          const optionIndex = votingOptions.findIndex(
            (opt) => opt.label === votedOption,
          );
          if (optionIndex !== -1) {
            optionColor =
              OPTION_BADGE_COLORS[optionIndex % OPTION_BADGE_COLORS.length];
          }
        }

        const authorImage = getAuthorImageUrl(comment.author);

        return (
          <div
            key={comment.id}
            className="rounded-100 border-border-subtle bg-background-default hover:border-border-brand border p-300 transition-colors"
          >
            <div className="mb-100 flex items-start justify-between">
              {/* 작성자 정보 */}
              <div className="flex items-center gap-150">
                <span onClick={(e) => e.stopPropagation()}>
                  <UserProfileModal
                    memberId={comment.author.id}
                    trigger={<UserAvatar size={28} image={authorImage} />}
                  />
                </span>
                <div className="flex flex-col gap-50">
                  <div className="flex items-center gap-100">
                    <span className="font-designer-13b text-text-strong">
                      {comment.author.nickname}
                    </span>
                    {votedOption && (
                      <div
                        className={cn(
                          'rounded-100 flex items-center gap-50 px-150 py-50',
                          optionColor.bg,
                        )}
                      >
                        <CheckCircle2
                          className={cn('h-3 w-3', optionColor.icon)}
                        />
                        <span
                          className={cn('font-designer-11b', optionColor.text)}
                        >
                          {votedOption}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-designer-11r text-text-subtlest">
                    {timeAgo}
                  </span>
                </div>
              </div>

              {/* 더보기 메뉴 (본인 댓글만) */}
              {comment.isAuthor && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === comment.id ? null : comment.id,
                      )
                    }
                    className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-hover hover:text-text-strong p-100 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenuId === comment.id && (
                    <>
                      {/* 백드롭 */}
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default bg-transparent"
                        aria-label="메뉴 닫기"
                        onClick={() => setOpenMenuId(null)}
                      />

                      {/* 메뉴 */}
                      <div className="rounded-100 border-border-subtle bg-background-default shadow-3 absolute top-full right-0 z-20 mt-50 min-w-[120px] border">
                        <button
                          type="button"
                          onClick={() => {
                            onEdit?.(comment.id, comment.content);
                            setOpenMenuId(null);
                          }}
                          className="font-designer-13r text-text-default hover:bg-fill-neutral-subtle-hover flex w-full items-center gap-150 px-300 py-200 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete?.(comment.id);
                            setOpenMenuId(null);
                          }}
                          className="font-designer-13r flex w-full items-center gap-150 px-300 py-200 text-red-600 transition-colors hover:bg-red-50"
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

            {/* 댓글 내용 또는 수정 폼 */}
            {isEditing && editingState ? (
              <div className="mt-200">
                <CommentForm
                  onSubmit={editingState.onUpdateComment}
                  initialValue={editingState.editingCommentContent}
                  placeholder="댓글을 수정하세요..."
                  autoFocus={true}
                  onCancel={editingState.onCancelEdit}
                />
              </div>
            ) : (
              <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
