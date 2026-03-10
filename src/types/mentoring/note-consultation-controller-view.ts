import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';

export type NoteConsultationListUiState = 'ready' | 'loading' | 'error';
export type NoteConsultationStatusTone = 'blue' | 'green' | 'orange' | 'red';

export interface NoteConsultationItemStatusSummary {
  key:
    | 'mentor-confirmation'
    | 'payment-confirmation'
    | 'first-reply'
    | 'my-reply'
    | 'counterpart-reply'
    | 'rejected';
  label: string;
  tone: NoteConsultationStatusTone;
}

export interface NoteConsultationChannelSummaryItem {
  key: NoteConsultationItemStatusSummary['key'];
  label: string;
  tone: NoteConsultationStatusTone;
  count: number;
}

export interface NoteConsultationControllerState {
  listState: NoteConsultationListUiState;
  activeChannel: NoteConsultationChannel;
  searchKeyword: string;
  selectedRequestId: string;
  draft: string;
  isSending: boolean;
}

export interface NoteConsultationControllerViewModel {
  hasAnyRequest: boolean;
  filteredItems: NoteConsultationListItem[];
  selectedItem?: NoteConsultationListItem;
  canSend: boolean;
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  activeChannelSummaryItems: NoteConsultationChannelSummaryItem[];
  pinnedItem?: NoteConsultationListItem;
  pinnedItemStatusSummary?: NoteConsultationItemStatusSummary;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  errorMessage: string;
}

export interface NoteConsultationControllerActions {
  setActiveChannel: (channel: NoteConsultationChannel) => void;
  setSearchKeyword: (keyword: string) => void;
  selectRequest: (requestId: string) => void;
  updateDraft: (value: string) => void;
  sendMessage: () => void;
}

export interface NoteConsultationControllerResult {
  state: NoteConsultationControllerState;
  viewModel: NoteConsultationControllerViewModel;
  actions: NoteConsultationControllerActions;
}
