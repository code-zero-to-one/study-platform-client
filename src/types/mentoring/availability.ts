import type { MentoringMethodType } from '@/types/mentoring/domain';

export type MentoringReservableMethodType = Exclude<
  MentoringMethodType,
  'note'
>;

export interface MentorAvailabilityQueryParams {
  mentorId: number;
  method: MentoringReservableMethodType;
  date: string;
}

export interface MentorAvailableSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface MentorAvailability {
  mentorId: number;
  method: MentoringReservableMethodType;
  date: string;
  timezone: string;
  durationMinutes?: number;
  slots: MentorAvailableSlot[];
}
