import {
  MessageCircle,
  Monitor,
  Phone,
  type LucideIcon,
  Users,
} from 'lucide-react';
import type { MentorRegistrationMethodField } from '@/types/mentoring/registration-view';
import {
  METHOD_PRICE_LIMITS,
  PRICE_FIELD_HARD_MAX,
} from '@/types/schemas/mentor-registration-schema';

const MENTORING_PRICE_INPUT_MIN = Math.min(
  METHOD_PRICE_LIMITS.note.min,
  METHOD_PRICE_LIMITS.simple.min,
  METHOD_PRICE_LIMITS.deep.min,
  METHOD_PRICE_LIMITS.offline.min,
);

export const MENTOR_REGISTRATION_PRICE_INPUT = {
  min: MENTORING_PRICE_INPUT_MIN,
  max: PRICE_FIELD_HARD_MAX,
  step: 1000,
  className: 'no-number-spin',
} as const;

export const MENTOR_REGISTRATION_METHOD_ICON_MAP: Record<
  MentorRegistrationMethodField['enabledField'],
  LucideIcon
> = {
  noteEnabled: MessageCircle,
  simpleEnabled: Phone,
  deepEnabled: Monitor,
  offlineEnabled: Users,
};
