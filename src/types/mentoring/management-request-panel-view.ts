import type { MentoringRequest } from '@/types/mentoring/management-domain';

export type MentoringRequestPanelMode = 'empty' | 'detail' | 'list';

export type MentoringRequestPanelStatusColor = 'orange' | 'green' | 'red';

export interface MentoringRequestRowViewModel {
  id: string;
  statusLabel: string;
  statusColor: MentoringRequestPanelStatusColor;
  methodLabel: string;
  menteeName: string;
  menteeRole: string;
  requestedAtText: string;
  preferredScheduleText: string;
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
