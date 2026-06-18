import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';

export interface NoteConsultationFiltersProps {
  activeChannel: NoteConsultationChannel;
  searchKeyword: string;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onSearchKeywordChange: (keyword: string) => void;
}

export interface NoteConsultationListProps {
  items: NoteConsultationListItem[];
  selectedRequestId: string;
  onSelectRequestId: (requestId: string) => void;
}

export interface NoteConsultationGridProps {
  activeChannel: NoteConsultationChannel;
  searchKeyword: string;
  filteredItems: NoteConsultationListItem[];
  selectedRequestId: string;
  selectedItem?: NoteConsultationListItem;
  draft: string;
  canSend: boolean;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onSearchKeywordChange: (keyword: string) => void;
  onSelectRequestId: (requestId: string) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}
