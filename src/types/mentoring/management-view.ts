import type { Dayjs } from 'dayjs';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';

export type MentoringMethodDurations = Record<MentoringMethodType, number>;

export interface MentorManagementWorkspaceProps {
  memberId: number;
  mentor: MentorProfile;
}

export interface MentoringRequestPanelProps {
  mentorId: number;
  methodDurations: MentoringMethodDurations;
  initialExpandedId?: string;
  filterRequestId?: string;
}

export interface MentoringRequestDetailCardProps {
  request: MentoringRequest;
  mentorId: number;
  methodDurations: MentoringMethodDurations;
}

export interface MentoringSchedulePanelProps {
  mentorId: number;
  methodDurations: MentoringMethodDurations;
}

export interface MentoringScheduleCalendarProps {
  sessions: MentoringSession[];
  pendingRequests?: MentoringRequest[];
  selectedDate: string;
  currentMonth: Dayjs;
  onDateSelect: (date: string) => void;
  onMonthChange: (month: Dayjs) => void;
}

export interface ScheduleEditorSubmitParams {
  startsAt: string;
  endsAt: string;
  placeNote: string;
  mentorNote: string;
}

export interface ScheduleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  method: MentoringMethodType;
  durationMinutes: number;
  defaultDate?: string;
  defaultTime?: string;
  defaultPlaceNote?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  sessions?: MentoringSession[];
  excludeSessionId?: string;
  onConfirm: (payload: ScheduleEditorSubmitParams) => void;
}
