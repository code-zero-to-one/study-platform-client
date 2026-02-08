'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import InquiryStatusBadge from '@/components/ui/badge/inquiry-status-badge';
import Button from '@/components/ui/button';
import { canViewInquiry, Inquiry } from '@/mocks/inquiry-mock-data';
import { useToastStore } from '@/stores/use-toast-store';

interface InquiryDetailProps {
  inquiry: Inquiry;
  currentUserId?: number;
  isMentor?: boolean;
  isAdmin?: boolean;
  onBack?: () => void;
  onAnswer?: (inquiryId: number, answer: string) => void;
  isGroupStudy?: boolean; // 그룹스터디 여부
  isForceShown?: boolean; // 강제 공개 여부 (프로토타입)
}

/**
 * 문의 상세 페이지 컴포넌트
 * - 제목, 작성 정보, 상태값, 본문, 첨부 이미지
 * - 답변 작성 폼 (멘토/관리자)
 * - 권한 체크
 */
export default function InquiryDetail({
  inquiry,
  currentUserId,
  isMentor = false,
  isAdmin = false,
  onBack,
  onAnswer,
  isGroupStudy = true,
  isForceShown = false,
}: InquiryDetailProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 권한 체크 (강제 공개일 경우 무시)
  const hasPermission =
    isForceShown || canViewInquiry(inquiry, currentUserId, isMentor, isAdmin);

  if (!hasPermission) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-300">
        <div className="text-600 text-text-subtle">🔒</div>
        <p className="font-designer-18b text-text-default">
          작성자만 확인할 수 있는 문의입니다
        </p>
        <Button onClick={onBack}>목록으로</Button>
      </div>
    );
  }

  const getInquiryTypeLabel = (
    type: Inquiry['type'],
    isGroupStudy: boolean = true,
  ) => {
    const labels: Record<Inquiry['type'], string> = {
      PAYMENT: '결제',
      STUDY: '스터디 일반',
      LEADER: isGroupStudy ? '리더' : '멘토',
      MENTOR: '멘토',
      BUG: '버그',
      GENERAL: '고민',
    };

    return labels[type];
  };

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) {
      showToast('답변 내용을 입력해주세요', 'error');

      return;
    }

    setIsSubmitting(true);

    // 프로토타입: 답변 등록 시뮬레이션
    setTimeout(() => {
      onAnswer?.(inquiry.id, answerContent);

      // 알림 시뮬레이션 (질문자에게)
      showToast(
        `${inquiry.authorName}님께 답변 완료 알림이 전송되었습니다.`,
        'success',
      );

      setAnswerContent('');
      setIsSubmitting(false);
    }, 500);
  };

  const canAnswer = (isMentor || isAdmin) && inquiry.status !== 'ANSWERED';

  return (
    <div className="flex flex-col gap-400">
      {/* 헤더 */}
      <div className="flex items-center gap-200">
        <button
          onClick={onBack}
          className="font-designer-14m text-text-subtle hover:text-text-default flex items-center gap-100 transition-colors"
        >
          <ArrowLeft className="h-200 w-200" />
          목록으로
        </button>
      </div>

      {/* 문의 정보 카드 */}
      <div className="rounded-200 border-border-default border bg-white p-500">
        {/* 상단: 분류만 표시 */}
        <div className="mb-300 flex items-center gap-200">
          <span className="font-designer-13m text-text-subtle rounded-100 bg-background-neutral-subtle px-200 py-100">
            {getInquiryTypeLabel(inquiry.type, isGroupStudy)}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="font-designer-24b text-text-default mb-300">
          {inquiry.title}
        </h1>

        {/* 작성자 정보 */}
        <div className="border-border-default mb-400 grid grid-cols-2 gap-x-400 gap-y-200 border-b pb-300">
          <div className="flex items-center gap-200">
            <span className="font-designer-14m text-text-subtle">작성자</span>
            <span className="font-designer-14m text-text-default">
              {inquiry.authorName}
            </span>
          </div>
          <div className="flex items-center gap-200">
            <span className="font-designer-14m text-text-subtle">작성일</span>
            <span className="font-designer-14m text-text-default">
              {format(new Date(inquiry.createdAt), 'yyyy.MM.dd HH:mm', {
                locale: ko,
              })}
            </span>
          </div>
          <div className="flex items-center gap-200">
            <span className="font-designer-14m text-text-subtle">조회수</span>
            <span className="font-designer-14m text-text-default">
              {inquiry.viewCount}
            </span>
          </div>
          <div className="flex items-center gap-200">
            <span className="font-designer-14m text-text-subtle">
              문의 상태
            </span>
            <InquiryStatusBadge status={inquiry.status} />
          </div>
        </div>

        {/* 본문 */}
        <div className="font-designer-16r text-text-default mb-400 whitespace-pre-line">
          {inquiry.content}
        </div>

        {/* 첨부 이미지 */}
        {inquiry.images && inquiry.images.length > 0 && (
          <div className="mt-400 flex flex-col gap-200">
            <p className="font-designer-14b text-text-default">첨부 이미지</p>
            <div className="flex flex-wrap gap-200">
              {inquiry.images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-100 border-border-default relative h-[200px] w-[200px] overflow-hidden border"
                >
                  <Image
                    src={image}
                    alt={`첨부 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 답변 (있을 경우) */}
      {inquiry.answer && (
        <div className="rounded-200 border-border-success bg-background-success-subtle border p-500">
          <div className="mb-300 flex items-center gap-200">
            <span className="font-designer-14b text-text-success">
              ✓ 답변 완료
            </span>
            <span className="font-designer-13m text-text-subtle">
              {inquiry.answer.authorName}
            </span>
            <span className="font-designer-13m text-text-subtle">
              {format(new Date(inquiry.answer.createdAt), 'yyyy.MM.dd HH:mm', {
                locale: ko,
              })}
            </span>
          </div>
          <div className="font-designer-16r text-text-default whitespace-pre-line">
            {inquiry.answer.content}
          </div>
        </div>
      )}

      {/* 답변 작성 폼 (멘토/관리자 전용) */}
      {canAnswer && (
        <div className="rounded-200 border-border-default border bg-white p-500">
          <h3 className="font-designer-18b text-text-default mb-300">
            답변 작성
          </h3>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="질문자에게 답변을 작성해주세요"
            className="rounded-100 border-border-default font-designer-14m focus:border-border-brand mb-300 min-h-[200px] w-full resize-none border px-300 py-200 focus:outline-none"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <p className="font-designer-12m text-text-subtlest">
              {answerContent.length}/2,000
            </p>
            <Button
              onClick={handleAnswerSubmit}
              disabled={isSubmitting || !answerContent.trim()}
              color="primary"
            >
              {isSubmitting ? '등록 중...' : '답변 등록'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
