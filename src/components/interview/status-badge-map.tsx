import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import { StudyProgressStatus } from '@/types/api/interview.types';

export function getStatusBadge(status: StudyProgressStatus): ReactNode {
  switch (status) {
    case 'PENDING':
      return <Badge color="default">시작 전</Badge>;
    case 'IN_PROGRESS':
      return <Badge color="blue">진행중</Badge>;
    case 'COMPLETE':
      return <Badge color="green">완료</Badge>;
    case 'ABSENT':
      return <Badge color="red">불참</Badge>;
    default:
      return null;
  }
}
