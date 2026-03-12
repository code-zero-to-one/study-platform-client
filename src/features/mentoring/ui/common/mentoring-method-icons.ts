import {
  MessageCircle,
  Monitor,
  Phone,
  type LucideIcon,
  Users,
} from 'lucide-react';
import type { MentoringMethodType } from '@/types/mentoring/domain';

export const mentoringMethodIconMap: Record<MentoringMethodType, LucideIcon> = {
  note: MessageCircle,
  simple: Phone,
  deep: Monitor,
  offline: Users,
};
