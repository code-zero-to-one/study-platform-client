import type {
  NoteConsultationItemStatusSummary,
  NoteConsultationStatusTab,
  NoteConsultationStatusFilter,
} from '@/types/mentoring/note-consultation-controller-view';
import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';
export interface NoteConsultationFiltersProps {
  activeChannel: NoteConsultationChannel;
  statusFilter: NoteConsultationStatusFilter;
  statusTabs: NoteConsultationStatusTab[];
  showChannelTabs?: boolean;
  compactLayout?: boolean;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onStatusFilterChange: (filter: NoteConsultationStatusFilter) => void;
}
export interface NoteConsultationListProps {
  items: NoteConsultationListItem[];
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  selectedRequestId: string;
  compactLayout?: boolean;
  onSelectRequestId: (requestId: string) => void;
}
export interface NoteConsultationGridProps {
  activeChannel: NoteConsultationChannel;
  statusFilter: NoteConsultationStatusFilter;
  statusTabs: NoteConsultationStatusTab[];
  showChannelTabs?: boolean;
  compactLayout?: boolean;
  filteredItems: NoteConsultationListItem[];
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>;
  selectedRequestId: string;
  selectedItem?: NoteConsultationListItem;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onStatusFilterChange: (filter: NoteConsultationStatusFilter) => void;
  onSelectRequestId: (requestId: string) => void;
  onBack: () => void;
}
