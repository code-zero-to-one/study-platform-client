import type { ReactNode } from 'react';
import Badge from '@/shared/ui/badge';
import { StudyProgressStatus } from '../../api/types';

export function getStatusBadge(status: StudyProgressStatus): ReactNode {
  switch (status) {
    case 'PENDING':
      return <Badge color="default">시작 전</Badge>;
    case 'IN_PROGRESS':
      return <Badge color="progress">진행중</Badge>;
    case 'COMPLETE':
      return <Badge color="completed">완료</Badge>;
    case 'ABSENT':
      return <Badge color="incomplete">불참</Badge>;
    default:
      return null;
  }
}
