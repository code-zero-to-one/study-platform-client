import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/confirm-delete-modal';
import DeleteGroupStudyMemberModal from '@/components/modals/delete-group-study-member';
import UserProfileModal from '@/components/modals/user-profile-modal';
import UserAvatar from '@/components/ui/avatar';
import MoreMenu from '@/components/ui/dropdown/more-menu';

import {
  useDeleteCommentMutation,
  useDeleteThreadMutation,
  useUpdateCommentMutation,
  useUpdateThreadMutation,
} from '@/hooks/queries/use-channel-query';
import { useLeaderInfo } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';
import { ResizedImage } from '@/types/api/group-study.types';
import CommentInput from './comment-input';

interface CommentProps {
  data: {
    commentId?: number;
    threadId: number;
    authorId: number;
    authorName: string;
    isLeader: boolean;
    updatedAt: string;
    content: string;
    image: {
      imageId: number;
      resizedImages: ResizedImage[];
    };
  };
  groupStudyId: number;
  mode: 'thread' | 'comment';
}

// 스레드용이냐 커맨트용이냐에 따라서 호출하는 함수가 달라짐
export default function Comment({ data, groupStudyId, mode }: CommentProps) {
  const memberId = useUserStore((state) => state.memberId);
  const leader = useLeaderInfo();

  const qc = useQueryClient();

  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] =
    useState<boolean>(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.content);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const { mutate: updateThread } = useUpdateThreadMutation();

  const { mutate: updateComment } = useUpdateCommentMutation();

  const { mutate: deleteThread } = useDeleteThreadMutation();

  const { mutate: deleteComment } = useDeleteCommentMutation();

  const handleUpdate = (threadId: number, commentId: number) => {
    const value = editValue.trim();
    if (!value) {
      console.warn('내용이 비었습니다.');

      return;
    }

    const base = { groupStudyId, threadId, content: value };
    if (mode === 'thread') {
      updateThread(base, {
        onSuccess: async () => {
          setIsEditing(false);
          await qc.invalidateQueries({
            queryKey: ['get-threads', groupStudyId],
          });
        },

        onError: (err: unknown) => console.error('스레드 수정 실패', err),
      });

      return;
    }

    if (commentId === null) {
      console.error('댓글 수정에는 commentId가 필요합니다.');

      return;
    }
    updateComment(
      { ...base, commentId },
      {
        onSuccess: async () => {
          setIsEditing(false);
          await qc.invalidateQueries({
            queryKey: ['comments', groupStudyId, threadId],
          });
        },

        onError: (err: unknown) => console.error(err),
      },
    );
  };

  const handleDelete = (threadId: number, commentId: number) => {
    const base = { groupStudyId, threadId };
    if (mode === 'thread') {
      deleteThread(base, {
        onSuccess: async () => {
          alert(mode === 'thread' ? '스레드 삭제 성공!' : '댓글 삭제 성공!');

          await qc.invalidateQueries({
            queryKey: ['get-threads', groupStudyId],
          });
        },
        onError: (err: unknown) => {
          alert(mode === 'thread' ? '스레드 삭제 실패:' : '댓글 삭제 실패:');
        },
        onSettled: () => {
          setShowConfirmModal(false);
        },
      });

      return;
    }

    // mode === 'comment'
    if (commentId === null) {
      console.error('댓글 삭제에는 commentId가 필요합니다.');

      return;
    }

    deleteComment(
      { ...base, commentId },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: ['comments', groupStudyId, threadId],
          });
        },
        onError: (err: unknown) => {
          console.error(err);
        },
        onSettled: () => {
          setShowConfirmModal(false);
        },
      },
    );
  };

  const getMenuOptions = () => {
    if (data.authorId === memberId) {
      return [
        {
          label: '수정하기',
          value: 'edit',
          onMenuClick: () => {
            setIsEditing(true);
          },
        },
        {
          label: '삭제하기',
          value: 'remove',
          onMenuClick: () => {
            setShowConfirmModal(true);
          },
        },
      ];
    }

    // 여기는 수아님과 동일한 기능
    if (data.authorId !== memberId && leader.memberId === memberId) {
      return [
        {
          label: '내보내기',
          value: 'remove',
          onMenuClick: () => {
            setIsDeleteMemberModalOpen(true);
          },
        },
      ];
    }

    return [];
  };

  return (
    <div className="flex w-full items-start">
      <ConfirmDeleteModal
        open={showConfirmModal}
        onOpenChange={() => setShowConfirmModal(false)}
        title={'댓글을 삭제하시겠습니까?'}
        content={
          <>
            삭제 시 모든 데이터가 영구적으로 제거됩니다.
            <br />이 동작은 되돌릴 수 없습니다.
          </>
        }
        confirmText={'댓글 삭제'}
        onConfirm={() => {
          handleDelete(data.threadId, data.commentId);
        }}
      />
      <div className="flex min-w-0 flex-1 items-start gap-150">
        <UserProfileModal
          memberId={data.authorId}
          trigger={
            <UserAvatar
              size={40}
              image={data.image?.resizedImages[0].resizedImageUrl}
            />
          }
        />
        {isEditing ? (
          <CommentInput
            mode={'edit'}
            content={data.content}
            onChange={(value) => setEditValue(value)}
            onCancel={() => setIsEditing(false)}
            onConfirm={async () => {
              handleUpdate(data.threadId, data.commentId);
            }}
          />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-100">
            <div className="flex items-center gap-100">
              <span className="font-designer-15b">{data.authorName}</span>
              {data.isLeader && (
                <div className="text-text-brand font-designer-12m bg-fill-brand-subtle-default rounded-[3px] px-75 py-[2.5px]">
                  스터디 리더
                </div>
              )}
              <span className="font-designer-13r text-text-subtlest">
                {dayjs(data.updatedAt).format('YYYY.MM.DD  HH:mm')}
              </span>
            </div>
            <p className="font-designer-15r wrap-anywhere whitespace-pre-wrap">
              {data.content}
            </p>
          </div>
        )}
      </div>
      <div className="ml-150">
        {getMenuOptions().length > 0 && (
          <MoreMenu options={getMenuOptions()} iconSize={24} />
        )}
      </div>

      <DeleteGroupStudyMemberModal
        open={isDeleteMemberModalOpen}
        onChangeOpen={setIsDeleteMemberModalOpen}
        groupStudyId={groupStudyId}
        targetMemberId={data.authorId}
      />
    </div>
  );
}
