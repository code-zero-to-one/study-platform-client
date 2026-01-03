'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import type {
  EvaluationDetailResponseDto,
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  HomeworkDetailResponseDto,
  PeerReviewResponse,
} from '@/api/openapi/models';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { useGetMission } from '@/hooks/queries/mission-api';
import {
  useCreatePeerReview,
  useGetPeerReviews,
} from '@/hooks/queries/peer-review-api';

interface HomeworkDetailContentProps {
  groupStudyId: number;
  missionId: number;
  homeworkId: number;
  isLeader?: boolean;
}

const GRADE_LABEL_CONFIG: Record<
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  string
> = {
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C_PLUS: 'C+',
  C: 'C',
  D_PLUS: 'D+',
  D: 'D',
  F: 'F',
};

export default function HomeworkDetailContent({
  missionId,
  homeworkId,
  isLeader = false,
}: HomeworkDetailContentProps) {
  const { data: mission, isLoading: isMissionLoading } =
    useGetMission(missionId);
  const { data: peerReviews, isLoading: isPeerReviewsLoading } =
    useGetPeerReviews(homeworkId);

  const homework = mission?.homeworks?.find(
    (hw) => hw.homeworkId === homeworkId,
  );

  if (isMissionLoading || isPeerReviewsLoading || !homework) {
    return null;
  }

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

        {/* 과제 내용 */}
        <div className="text-text-default font-designer-14r whitespace-pre-wrap">
          {homework.homeworkTextContent}
        </div>

        {/* 제출한 과제 링크 */}
        {homework.homeworkLink && (
          <div className="flex flex-col gap-100">
            <span className="font-designer-14b text-text-default">
              제출한 과제
            </span>
            <a
              href={homework.homeworkLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-brand font-designer-14r hover:underline"
            >
              {homework.homeworkLink}
            </a>
          </div>
        )}
      </div>

      {/* 리더 평가 */}
      <LeaderEvaluationSection
        evaluation={homework.evaluation}
        isLeader={isLeader}
      />

      {/* 피어 리뷰 */}
      <PeerReviewSection
        homeworkId={homeworkId}
        peerReviews={peerReviews ?? []}
      />
    </div>
  );
}

interface LeaderEvaluationSectionProps {
  evaluation?: EvaluationDetailResponseDto;
  isLeader: boolean;
}

function LeaderEvaluationSection({
  evaluation,
  isLeader,
}: LeaderEvaluationSectionProps) {
  return (
    <div className="flex flex-col gap-200">
      <span className="font-designer-18b text-text-default">리더 평가</span>

      <div className="border-border-default rounded-100 flex flex-col items-center justify-center gap-200 border p-400">
        {evaluation ? (
          <EvaluationResult evaluation={evaluation} />
        ) : (
          <EvaluationPending isLeader={isLeader} />
        )}
      </div>
    </div>
  );
}

function EvaluationResult({
  evaluation,
}: {
  evaluation: EvaluationDetailResponseDto;
}) {
  return (
    <div className="flex w-full flex-col gap-200">
      <div className="flex items-center gap-200">
        <span className="font-designer-14b text-text-default">평가 등급</span>
        <span className="text-text-brand font-designer-16b">
          {evaluation.evaluationGrade
            ? GRADE_LABEL_CONFIG[evaluation.evaluationGrade]
            : '-'}
        </span>
      </div>
      <div className="flex flex-col gap-100">
        <span className="font-designer-14b text-text-default">평가 코멘트</span>
        <p className="text-text-default font-designer-14r">
          {evaluation.evaluationComment}
        </p>
      </div>
    </div>
  );
}

function EvaluationPending({ isLeader }: { isLeader: boolean }) {
  return (
    <>
      <span className="text-text-subtlest font-designer-14r">
        아직 평가하지 않은 과제입니다.
      </span>
      {isLeader && (
        <Button color="primary" size="small">
          과제 평가하기
        </Button>
      )}
    </>
  );
}

interface PeerReviewSectionProps {
  homeworkId: number;
  peerReviews: PeerReviewResponse[];
}

function PeerReviewSection({
  homeworkId,
  peerReviews,
}: PeerReviewSectionProps) {
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
              <PeerReviewItem key={review.peerReviewId} review={review} />
            ))}
          </div>
        )}

        {/* 리뷰 입력 */}
        <PeerReviewInput
          value={reviewText}
          onChange={setReviewText}
          onSubmit={handleSubmitReview}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}

interface PeerReviewItemProps {
  review: PeerReviewResponse;
}

function PeerReviewItem({ review }: PeerReviewItemProps) {
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

  return (
    <div className="flex flex-col gap-150">
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
        <button className="text-text-subtlest hover:text-text-default">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-text-default font-designer-14r">{review.comment}</p>
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
