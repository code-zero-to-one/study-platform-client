import type { MentoringRequest } from '@/types/mentoring/management-domain';

export type MentoringRequestPanelMode = 'empty' | 'detail' | 'list';

export type MentoringRequestPanelStatusColor =
  | 'orange'
  | 'green'
  | 'red'
  | 'blue';
export type MentoringRequestPanelMetaColor =
  | 'orange'
  | 'green'
  | 'red'
  | 'blue'
  | 'gray';

export interface MentoringRequestRowViewModel {
  id: string;
  statusLabel: string;
  statusColor: MentoringRequestPanelStatusColor;
  paymentStatusLabel: string;
  paymentStatusColor: MentoringRequestPanelMetaColor;
  methodLabel: string;
  menteeName: string;
  menteeRole: string;
  requestedAtText: string;
  requestedAtLabel: string;
  preferredScheduleText: string;
  preferredScheduleLabel: string;
  attentionLabel?: string;
  attentionColor?: MentoringRequestPanelMetaColor;
  actionLabel: string;
  actionDescription: string;
}

export interface MentoringRequestPanelState {
  mode: MentoringRequestPanelMode;
  urgentCount: number;
  detailRequest?: MentoringRequest;
}

export interface MentoringRequestPanelViewModel {
  titleText: string;
  showUrgentBanner: boolean;
  rows: MentoringRequestRowViewModel[];
}

export interface MentoringRequestPanelActions {
  toRequestDetailHref: (requestId: string) => string;
}

export interface UseMentoringRequestPanelControllerParams {
  mentorId: number;
  filterRequestId?: string;
}

export interface MentoringRequestPanelControllerResult {
  state: MentoringRequestPanelState;
  viewModel: MentoringRequestPanelViewModel;
  actions: MentoringRequestPanelActions;
}
