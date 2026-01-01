'use client';

import { MoreHorizontal, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';

interface HomeworkDetailContentProps {
  groupStudyId: number;
  missionId: number;
  homeworkId: number;
  isLeader?: boolean;
}

interface ResizedImage {
  resizedImageId: number;
  imageUrl: string;
  width: number;
  height: number;
}

interface ProfileImage {
  imageId: number;
  resizedImages: ResizedImage[];
}

interface Evaluation {
  evaluationId: number;
  evaluationGrade:
    | 'A_PLUS'
    | 'A'
    | 'B_PLUS'
    | 'B'
    | 'C_PLUS'
    | 'C'
    | 'D_PLUS'
    | 'D'
    | 'F';
  evaluationComment: string;
}

interface PeerReview {
  peerReviewId: number;
  reviewerId: number;
  reviewerNickname: string;
  reviewerProfileImage?: ProfileImage;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
}

interface HomeworkDetail {
  homeworkId: number;
  homeworkStatus: 'EVALUATION_COMPLETED' | 'SUBMITTED' | 'NOT_SUBMITTED';
  submissionTime: string;
  submitterId: number;
  submitterNickname: string;
  submitterProfileImage?: ProfileImage;
  homeworkTextContent: string;
  homeworkLink?: string;
  evaluation?: Evaluation;
  peerReviews: PeerReview[];
}

// TODO: API 연결 시 삭제
const MOCK_HOMEWORK_DETAIL: HomeworkDetail = {
  homeworkId: 1,
  homeworkStatus: 'SUBMITTED',
  submissionTime: '2025-01-08T14:30:00',
  submitterId: 10,
  submitterNickname: '최현우',
  submitterProfileImage: {
    imageId: 5,
    resizedImages: [
      {
        resizedImageId: 15,
        imageUrl: 'https://example.com/profile_small.jpg',
        width: 100,
        height: 100,
      },
    ],
  },
  homeworkTextContent: `운영체제의 기초 개념에 대해 학습한 내용을 정리했습니다.

1. 운영체제의 역할
- 하드웨어와 소프트웨어의 중재자
- 자원 관리 및 할당
- 사용자 인터페이스 제공

2. 프로세스와 스레드
프로세스는 실행 중인 프로그램의 인스턴스이며, 독립적인 메모리 공간을 가집니다. 반면 스레드는 프로세스 내에서 실행되는 작업 단위로, 같은 프로세스의 스레드들은 메모리를 공유합니다.

3. 메모리 관리
운영체제는 메모리를 효율적으로 관리하기 위해 페이징, 세그멘테이션 등의 기법을 사용합니다.`,
  homeworkLink: 'https://notion.so/my-os-study',
  evaluation: undefined,
  peerReviews: [
    {
      peerReviewId: 1,
      reviewerId: 11,
      reviewerNickname: '최수연',
      reviewerProfileImage: undefined,
      content: '프로세스와 스레드의 차이점을 명확하게 정리하셨네요!',
      createdAt: '2025-09-08T10:00:00',
      likeCount: 2,
      dislikeCount: 1,
    },
    {
      peerReviewId: 2,
      reviewerId: 12,
      reviewerNickname: '최수연',
      reviewerProfileImage: undefined,
      content: '프로세스와 스레드의 차이점을 명확하게 정리하셨네요!',
      createdAt: '2025-09-08T11:00:00',
      likeCount: 2,
      dislikeCount: 1,
    },
  ],
};

export default function HomeworkDetailContent({
  groupStudyId: _groupStudyId,
  missionId: _missionId,
  homeworkId: _homeworkId,
  isLeader = false,
}: HomeworkDetailContentProps) {
  // TODO: API 연결
  const homework = MOCK_HOMEWORK_DETAIL;

  const profileImageUrl =
    homework.submitterProfileImage?.resizedImages[0]?.imageUrl ??
    '/profile-default.svg';

  const formatDate = (dateString: string) => {
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
      <PeerReviewSection peerReviews={homework.peerReviews} />
    </div>
  );
}

interface LeaderEvaluationSectionProps {
  evaluation?: Evaluation;
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

function EvaluationResult({ evaluation }: { evaluation: Evaluation }) {
  const GRADE_LABEL_CONFIG: Record<Evaluation['evaluationGrade'], string> = {
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

  return (
    <div className="flex w-full flex-col gap-200">
      <div className="flex items-center gap-200">
        <span className="font-designer-14b text-text-default">평가 등급</span>
        <span className="text-text-brand font-designer-16b">
          {GRADE_LABEL_CONFIG[evaluation.evaluationGrade]}
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
  peerReviews: PeerReview[];
}

function PeerReviewSection({ peerReviews }: PeerReviewSectionProps) {
  const [reviewText, setReviewText] = useState('');

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    // TODO: API 연결
    console.log('Submit review:', reviewText);
    setReviewText('');
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
        />
      </div>
    </div>
  );
}

interface PeerReviewItemProps {
  review: PeerReview;
}

function PeerReviewItem({ review }: PeerReviewItemProps) {
  const profileImageUrl =
    review.reviewerProfileImage?.resizedImages[0]?.imageUrl ??
    '/profile-default.svg';

  const formatDateTime = (dateString: string) => {
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
            </span>
          </div>
        </div>
        <button className="text-text-subtlest hover:text-text-default">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-text-default font-designer-14r">{review.content}</p>

      <div className="flex items-center gap-200">
        <button className="text-text-subtlest hover:text-text-default flex items-center gap-50">
          <ThumbsUp size={16} />
          <span className="font-designer-12r">{review.likeCount}</span>
        </button>
        <button className="text-text-subtlest hover:text-text-default flex items-center gap-50">
          <ThumbsDown size={16} />
          <span className="font-designer-12r">{review.dislikeCount}</span>
        </button>
      </div>
    </div>
  );
}

interface PeerReviewInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function PeerReviewInput({ value, onChange, onSubmit }: PeerReviewInputProps) {
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
          disabled={!value.trim()}
        >
          등록
        </Button>
      </div>
    </div>
  );
}
