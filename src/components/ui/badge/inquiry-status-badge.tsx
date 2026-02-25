import Badge from '@/components/ui/badge';

export type InquiryStatus = 'ACCEPTED' | 'ANSWER_COMPLETED';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { color: 'gray' | 'green'; label: string }
> = {
  ACCEPTED: { color: 'gray', label: '접수' },
  ANSWER_COMPLETED: { color: 'green', label: '답변 완료' },
};

export default function InquiryStatusBadge({
  status,
}: InquiryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ACCEPTED;

  return <Badge color={config.color}>{config.label}</Badge>;
}
