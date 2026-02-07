'use client';

import Badge from './index';

export type InquiryStatus = 'PENDING' | 'IN_REVIEW' | 'ANSWERED';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

/**
 * 문의 상태 배지 컴포넌트
 * - 접수: 회색
 * - 답변 대기: 주황색
 * - 답변 완료: 초록색
 */
export default function InquiryStatusBadge({
  status,
  className,
}: InquiryStatusBadgeProps) {
  const statusConfig = {
    PENDING: { label: '접수', color: 'gray' as const },
    IN_REVIEW: { label: '답변 대기', color: 'orange' as const },
    ANSWERED: { label: '답변 완료', color: 'green' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  );
}
