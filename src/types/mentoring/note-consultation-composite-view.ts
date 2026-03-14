import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';
import type {
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
  selectedRequestId: string;
  selectedItem?: NoteConsultationListItem;
  selectedRequest?: MentoringRequest;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  canAcceptSelectedRequest?: boolean;
  isAcceptingRequest?: boolean;
  canCloseSelectedRequest?: boolean;
  isClosingRequest?: boolean;
  canSendSelectedMessage?: boolean;
  canEditSelectedReply?: boolean;
  isEditingSelectedReply?: boolean;
  canSubmitSelectedMessage?: boolean;
  isSendingMessage?: boolean;
  useRichMessageComposer?: boolean;
  messageDraft?: string;
  messageContents?: MentoringRequestContentBlock[];
  messageDraftMetaLabel?: string;
  messagePlaceholder?: string;
  sendButtonLabel?: string;
  paidFollowupNoticeTitle?: string;
  paidFollowupNoticeDescription?: string;
  paidFollowupActionLabel?: string;
  paidFollowupActionHref?: string;
  onActiveChannelChange: (channel: NoteConsultationChannel) => void;
  onAcceptSelectedRequest?: () => void;
  onCloseSelectedRequest?: () => void;
  onStartEditingSelectedReply?: () => void;
  onCancelEditingSelectedReply?: () => void;
  onMessageDraftChange?: (value: string) => void;
  onMessageContentsChange?: (next: MentoringRequestContentBlock[]) => void;
  onSendSelectedMessage?: () => void;
  onStatusFilterChange: (filter: NoteConsultationStatusFilter) => void;
  onSelectRequestId: (requestId: string) => void;
  onBack: () => void;
}
