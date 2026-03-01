import type { QuestionListItemResponse } from '@/api/endpoints/group-study/question-api';
import Badge from '@/components/ui/badge';

type InquiryStatus = QuestionListItemResponse['status'];

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
