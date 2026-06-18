import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';

export type NoteConsultationListUiState = 'ready' | 'loading' | 'error';

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
