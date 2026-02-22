'use client';

import Badge from './index';

export type InquiryStatus = 'PENDING' | 'ANSWERED';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

/**
 * 문의 상태 배지 컴포넌트
 * - 접수: 회색
 * - 답변 완료: 초록색
 */
export default function InquiryStatusBadge({
  status,
  className,
}: InquiryStatusBadgeProps) {
  const statusConfig: Record<
    InquiryStatus,
    { label: string; color: 'gray' | 'green' }
  > = {
    PENDING: { label: '접수', color: 'gray' },
    ANSWERED: { label: '답변 완료', color: 'green' },
  };

  const config = statusConfig[status];

  if (!config) {
    console.error(`Unknown inquiry status: ${status}`);

    return null;
  }

  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  );
}
