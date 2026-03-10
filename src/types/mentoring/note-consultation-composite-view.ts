import type {
  NoteConsultationChannelSummaryItem,
  NoteConsultationItemStatusSummary,
} from '@/types/mentoring/note-consultation-controller-view';
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
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  selectedRequestId: string;
  onSelectRequestId: (requestId: string) => void;
}

export interface NoteConsultationGridProps {
  activeChannel: NoteConsultationChannel;
  searchKeyword: string;
  filteredItems: NoteConsultationListItem[];
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  activeChannelSummaryItems: NoteConsultationChannelSummaryItem[];
  selectedRequestId: string;
  selectedItem?: NoteConsultationListItem;
  pinnedItem?: NoteConsultationListItem;
  pinnedItemStatusSummary?: NoteConsultationItemStatusSummary;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  draft: string;
  canSend: boolean;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onSearchKeywordChange: (keyword: string) => void;
  onSelectRequestId: (requestId: string) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}
