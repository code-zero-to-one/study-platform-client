'use client';

import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type {
  EvaluationResponse,
  PeerReviewResponse,
} from '@/api/openapi/models';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import ConfirmDeleteModal from '@/features/study/group/ui/confirm-delete-modal';
import {
  useDeleteHomework,
  useGetHomework,
} from '@/hooks/queries/group-study-homework-api';
import {
  useCreatePeerReview,
  useDeletePeerReview,
  useUpdatePeerReview,
} from '@/hooks/queries/peer-review-api';
import { useIsLeader } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';
import CreateEvaluationModal from '../modals/create-evaluation-modal';
import DeleteHomeworkModal from '../modals/delete-homework-modal';
import EditHomeworkModal from '../modals/edit-homework-modal';

interface HomeworkDetailContentProps {
  groupStudyId: number;
  missionId: number;
  homeworkId: number;
}

export default function HomeworkDetailContent({
  homeworkId,
}: HomeworkDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = useUserStore((state) => state.memberId);
  const isLeader = useIsLeader(currentUserId);
  const { data: homework, isLoading: isHomeworkLoading } =
    useGetHomework(homeworkId);

  const handleDeleteSuccess = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('homeworkId');
    router.push(`?${params.toString()}`);
  };

  if (isHomeworkLoading || !homework) {
    return null;
  }

  const peerReviews = homework.peerReviews ?? [];
  const isEvaluated = !!homework.evaluation;

  const profileImageUrl =
    homework.submitterProfileImage?.resizedImages?.[0]?.resizedImageUrl ??
    '/profile-default.svg';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    return `${dayjs(dateString).format('YYYY-MM-DD')} 제출`;
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

          {/* 수정/삭제 버튼 - 평가 전에만 노출 */}
          {!isEvaluated && (
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

      {/* 리더 평가 */}
      <LeaderEvaluationSection
        evaluation={homework.evaluation}
        isLeader={isLeader}
        homeworkId={homeworkId}
      />

      {/* 피어 리뷰 */}
      <PeerReviewSection
        homeworkId={homeworkId}
        peerReviews={peerReviews ?? []}
        isLeader={isLeader}
        isMyHomework={homework.submitterId === currentUserId}
      />
    </div>
  );
}

interface LeaderEvaluationSectionProps {
  evaluation?: EvaluationResponse;
  isLeader: boolean;
  homeworkId: number;
}

function LeaderEvaluationSection({
  evaluation,
  isLeader,
  homeworkId,
}: LeaderEvaluationSectionProps) {
  return (
    <div className="flex flex-col gap-200">
      <span className="font-designer-18b text-text-default">리더 평가</span>

      <div className="border-border-default rounded-100 flex flex-col items-center justify-center gap-200 border p-400">
        {evaluation ? (
          <EvaluationResult evaluation={evaluation} />
        ) : (
          <EvaluationPending isLeader={isLeader} homeworkId={homeworkId} />
        )}
      </div>
    </div>
  );
}

function EvaluationResult({ evaluation }: { evaluation: EvaluationResponse }) {
  return (
    <div className="flex w-full flex-col gap-200">
      <div className="flex items-center gap-200">
        <span className="font-designer-14b text-text-default">평가 등급</span>
        <span className="text-text-brand font-designer-16b">
          {evaluation.grade?.gradeLabel ?? '-'}
        </span>
      </div>
      <div className="flex flex-col gap-100">
        <span className="font-designer-14b text-text-default">평가 코멘트</span>
        <p className="text-text-default font-designer-14r">
          {evaluation.comment}
        </p>
      </div>
    </div>
  );
}

function EvaluationPending({
  isLeader,
  homeworkId,
}: {
  isLeader: boolean;
  homeworkId: number;
}) {
  return (
    <>
      <span className="text-text-subtlest font-designer-14r">
        아직 평가하지 않은 과제입니다.
      </span>
      {isLeader && <CreateEvaluationModal homeworkId={homeworkId} />}
    </>
  );
}

interface PeerReviewSectionProps {
  homeworkId: number;
  peerReviews: PeerReviewResponse[];
  isLeader: boolean;
  isMyHomework: boolean;
}

function PeerReviewSection({
  homeworkId,
  peerReviews,
  isLeader,
  isMyHomework,
}: PeerReviewSectionProps) {
  const canWriteReview = !isLeader && !isMyHomework;
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

    return dayjs(dateString).format('YYYY.MM.DD HH:mm');
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
