import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';
export type NoteConsultationListUiState = 'ready' | 'loading' | 'error';
export type NoteConsultationStatusTone = 'blue' | 'green' | 'orange' | 'red';
export type NoteConsultationStatusFilter =
  | 'all'
  | 'mentor-requested'
  | 'mentor-drafting'
  | 'mentor-completed'
  | 'mentee-pending'
  | 'mentee-answered'
  | 'mentee-completed';
export interface NoteConsultationStatusTab {
  key: NoteConsultationStatusFilter;
  label: string;
  count: number;
}
export interface NoteConsultationItemStatusSummary {
  key: 'pending' | 'rejected' | 'completed';
  label: string;
  tone: NoteConsultationStatusTone;
}
export interface NoteConsultationControllerState {
  listState: NoteConsultationListUiState;
  activeChannel: NoteConsultationChannel;
  statusFilter: NoteConsultationStatusFilter;
  selectedRequestId: string;
}
export interface NoteConsultationControllerViewModel {
  hasAnyRequest: boolean;
  filteredItems: NoteConsultationListItem[];
  statusTabs: NoteConsultationStatusTab[];
  selectedItem?: NoteConsultationListItem;
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  errorMessage: string;
}
export interface NoteConsultationControllerActions {
  setActiveChannel: (channel: NoteConsultationChannel) => void;
  setStatusFilter: (filter: NoteConsultationStatusFilter) => void;
  selectRequest: (requestId: string) => void;
}
export interface NoteConsultationControllerResult {
  state: NoteConsultationControllerState;
  viewModel: NoteConsultationControllerViewModel;
  actions: NoteConsultationControllerActions;
}
