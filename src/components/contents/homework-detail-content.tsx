'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { PeerReviewResponse } from '@/api/openapi/models';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import ConfirmDeleteModal from '@/features/study/group/ui/confirm-delete-modal';
import { useGetHomework } from '@/hooks/queries/group-study-homework-api';
import { useGetMission } from '@/hooks/queries/mission-api';
import {
  useCreatePeerReview,
  useDeletePeerReview,
  useUpdatePeerReview,
} from '@/hooks/queries/peer-review-api';
import { useUserStore } from '@/stores/useUserStore';
import DeleteHomeworkModal from '../modals/delete-homework-modal';
import EditHomeworkModal from '../modals/edit-homework-modal';

interface HomeworkDetailContentProps {
  groupStudyId: number;
  missionId: number;
  homeworkId: number;
}

export default function HomeworkDetailContent({
  homeworkId,
  missionId,
}: HomeworkDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = useUserStore((state) => state.memberId);
  const { data: homework, isLoading: isHomeworkLoading } =
    useGetHomework(homeworkId);
  const {
    data: mission,
    isLoading: isMissionLoading,
    refetch: refetchMission,
  } = useGetMission(missionId);

  const handleDeleteSuccess = async () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('homeworkId');
    router.push(`?${params.toString()}`);
    await refetchMission();
  };

  if (isHomeworkLoading || !homework || isMissionLoading || !mission) {
    return null;
  }

  const peerReviews = homework.peerReviews ?? [];

  // 미션 제출 가능 기간이 지나지 않았는지 확인
  const isMissionActive = mission.status !== 'ENDED';

  // 수정/삭제 가능 조건: 본인 과제이면서 미션 제출 가능 기간이 지나지 않은 상태
  const isMyHomework = homework.submitterId === currentUserId;
  const canEditOrDelete = isMyHomework && isMissionActive;

  const profileImageUrl =
    homework.submitterProfileImage?.resizedImages?.[0]?.resizedImageUrl ??
    '/profile-default.svg';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 제출`;
  };

  return (
    <div className="flex flex-col gap-400">
      {/* 제출자 정보 및 과제 내용 */}
      <div className="border-border-default rounded-100 flex flex-col gap-300 border p-400">
        {/* 제출자 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-150">
            <Avatar image={profileImageUrl} size={40} />
            <div className="flex flex-col">
              <span className="font-designer-14b text-text-default">
                {homework.submitterNickname}
              </span>
              <span className="text-text-subtlest font-designer-12r">
                {formatDate(homework.submissionTime)}
              </span>
            </div>
          </div>

          {/* 수정/삭제 버튼 - 본인 과제이면서 평가 전이면서 미션 제출 가능 기간이 지나지 않은 경우에만 노출 */}
          {canEditOrDelete && (
            <div className="flex items-center gap-100">
              <EditHomeworkModal
                homeworkId={homeworkId}
                defaultValue={{
                  textContent: homework.homeworkContent.textContent,
                  attachmentLink: homework.homeworkContent.optionalContent.link,
                }}
              />
              <DeleteHomeworkModal
                homeworkId={homeworkId}
                onSuccess={handleDeleteSuccess}
              />
            </div>
          )}
        </div>

        {/* 과제 내용 */}
        <div className="text-text-default font-designer-14r whitespace-pre-wrap">
          {homework.homeworkContent?.textContent}
        </div>

        {/* 제출한 과제 링크 */}
        {homework.homeworkContent?.optionalContent?.link && (
          <div className="flex flex-col gap-100">
            <span className="font-designer-14b text-text-default">
              제출한 과제
            </span>
            <a
              href={homework.homeworkContent.optionalContent.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-brand font-designer-14r hover:underline"
            >
              {homework.homeworkContent.optionalContent.link}
            </a>
          </div>
        )}
      </div>

      {/* 피어 리뷰 */}
      <PeerReviewSection
        homeworkId={homeworkId}
        peerReviews={peerReviews ?? []}
        isMyHomework={isMyHomework}
      />
    </div>
  );
}

interface PeerReviewSectionProps {
  homeworkId: number;
  peerReviews: PeerReviewResponse[];
  isMyHomework: boolean;
}

function PeerReviewSection({
  homeworkId,
  peerReviews,
  isMyHomework,
}: PeerReviewSectionProps) {
  const canWriteReview = !isMyHomework;
  const [reviewText, setReviewText] = useState('');
  const { mutate: createPeerReview, isPending } = useCreatePeerReview();

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;

    createPeerReview(
      {
        homeworkId,
        request: { comment: reviewText },
      },
      {
        onSuccess: () => {
          setReviewText('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-200">
      <div className="flex items-center gap-100">
        <span className="font-designer-18b text-text-default">피어 리뷰</span>
        <span className="text-text-subtlest font-designer-14r">
          {peerReviews.length}건
        </span>
      </div>

      <div className="border-border-default rounded-100 flex flex-col gap-300 border p-400">
        {/* 피어 리뷰 목록 */}
        {peerReviews.length > 0 && (
          <div className="flex flex-col gap-200">
            {peerReviews.map((review) => (
              <PeerReviewItem
                key={review.peerReviewId}
                review={review}
                homeworkId={homeworkId}
              />
            ))}
          </div>
        )}

        {/* 리뷰 입력 - 리더가 아니고 자기 과제가 아닌 경우에만 표시 */}
        {canWriteReview && (
          <PeerReviewInput
            value={reviewText}
            onChange={setReviewText}
            onSubmit={handleSubmitReview}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}

interface PeerReviewItemProps {
  review: PeerReviewResponse;
  homeworkId: number;
}

function PeerReviewItem({ review, homeworkId }: PeerReviewItemProps) {
  const currentUserId = useUserStore((state) => state.memberId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(review.comment ?? '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: updatePeerReview, isPending: isUpdating } =
    useUpdatePeerReview();
  const { mutate: deletePeerReview, isPending: isDeleting } =
    useDeletePeerReview();

  const isMyReview = review.reviewerId === currentUserId;

  const profileImageUrl =
    review.reviewerProfileImage?.resizedImages?.[0]?.resizedImageUrl ??
    '/profile-default.svg';

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const handleUpdate = () => {
    if (!editValue.trim() || !review.peerReviewId) return;

    updatePeerReview(
      {
        peerReviewId: review.peerReviewId,
        request: { comment: editValue },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!review.peerReviewId) return;

    deletePeerReview(review.peerReviewId, {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
    });
  };

  const getMenuOptions = () => {
    if (!isMyReview) return [];

    return [
      {
        label: '수정하기',
        value: 'edit',
        onMenuClick: () => {
          setEditValue(review.comment ?? '');
          setIsEditing(true);
        },
      },
      {
        label: '삭제하기',
        value: 'delete',
        onMenuClick: () => {
          setShowDeleteModal(true);
        },
      },
    ];
  };

  return (
    <div className="flex flex-col gap-150">
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={() => setShowDeleteModal(false)}
        title="피어 리뷰를 삭제하시겠습니까?"
        content={
          <>
            삭제 시 모든 데이터가 영구적으로 제거됩니다.
            <br />이 동작은 되돌릴 수 없습니다.
          </>
        }
        confirmText="삭제"
        onConfirm={handleDelete}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-150">
          <Avatar image={profileImageUrl} size={32} />
          <div className="flex items-center gap-100">
            <span className="font-designer-14b text-text-default">
              {review.reviewerNickname}
            </span>
            <span className="text-text-subtlest font-designer-12r">
              {formatDateTime(review.createdAt)}
              {review.updated && ' (수정됨)'}
            </span>
          </div>
        </div>
        {isMyReview && <MoreMenu options={getMenuOptions()} iconSize={20} />}
      </div>

      {isEditing ? (
        <div className="border-border-default rounded-100 flex flex-col gap-150 border p-300">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-text-default font-designer-14r min-h-[60px] resize-none outline-none"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-text-subtlest font-designer-12r">
              {editValue.length}/1,000
            </span>
            <div className="flex gap-100">
              <Button
                color="secondary"
                size="xsmall"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="xsmall"
                onClick={handleUpdate}
                disabled={!editValue.trim() || isUpdating}
              >
                {isUpdating ? '수정 중...' : '수정'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-text-default font-designer-14r">{review.comment}</p>
      )}
    </div>
  );
}

interface PeerReviewInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

function PeerReviewInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: PeerReviewInputProps) {
  return (
    <div className="border-border-default rounded-100 flex flex-col gap-150 border p-300">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="피어 리뷰를 작성해주세요."
        className="text-text-default font-designer-14r min-h-[60px] resize-none outline-none"
        maxLength={1000}
      />
      <div className="flex items-center justify-between">
        <span className="text-text-subtlest font-designer-12r">
          {value.length}/1,000
        </span>
        <Button
          color="secondary"
          size="xsmall"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? '등록 중...' : '등록'}
        </Button>
      </div>
    </div>
  );
}
