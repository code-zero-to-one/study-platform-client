'use client';

import MentoringListTemplate from '@/features/mentoring/ui/common/mentoring-list-template';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import {
  NoteConsultationEmpty,
  NoteConsultationGrid,
  NoteConsultationHeader,
} from '@/features/mentoring/ui/note-consultation/note-consultation-composite';
import { useNoteConsultationController } from '@/features/mentoring/model/use-note-consultation-controller';
import { useNoteConsultationDetailController } from '@/features/mentoring/model/use-note-consultation-detail-controller';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';

interface NoteConsultationContainerProps {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
  lockedChannel?: NoteConsultationChannel;
  statusTabPreset?: 'mentor' | 'mentee' | 'none';
  hideToolbar?: boolean;
  mentorIdOverride?: number;
}

export default function NoteConsultationContainer({
  initialRequestId,
  initialChannel,
  lockedChannel,
  statusTabPreset = 'none',
  hideToolbar = false,
  mentorIdOverride,
}: NoteConsultationContainerProps) {
  const { state, viewModel, actions } = useNoteConsultationController({
    initialRequestId,
    initialChannel,
    lockedChannel,
    statusTabPreset,
    mentorIdOverride,
  });
  const activeChannel = lockedChannel ?? state.activeChannel;
  const {
    state: detailState,
    viewModel: detailViewModel,
    actions: detailActions,
  } = useNoteConsultationDetailController({
    activeChannel,
    mentorIdOverride,
    selectedItem: viewModel.selectedItem,
  });

  return (
    <MentoringStateBoundary
      state={state.listState}
      loading={
        <div className="flex flex-col gap-300">
          {hideToolbar ? null : (
            <div className="h-[40px] w-[200px] rounded-100 bg-background-alternative animate-pulse" />
          )}
          <div className="h-[clamp(640px,calc(100dvh-220px),780px)] rounded-200 bg-background-alternative animate-pulse" />
        </div>
      }
      error={
        <div className="rounded-200 border-border-subtle bg-background-default border px-300 py-300 text-center">
          <p className="font-designer-16m text-text-default">
            {viewModel.errorMessage}
          </p>
        </div>
      }
      ready={
        <MentoringListTemplate
          toolbar={hideToolbar ? undefined : <NoteConsultationHeader />}
          content={
            viewModel.hasAnyRequest ? (
              <NoteConsultationGrid
                activeChannel={activeChannel}
                statusFilter={state.statusFilter}
                statusTabs={viewModel.statusTabs}
                showChannelTabs={!lockedChannel}
                compactLayout={hideToolbar}
                filteredItems={viewModel.filteredItems}
                selectedRequestId={state.selectedRequestId}
                selectedItem={detailViewModel.effectiveSelectedItem}
                selectedRequest={detailViewModel.selectedRequest}
                isRestoringPinnedItem={viewModel.isRestoringPinnedItem}
                hasMissingPinnedItem={viewModel.hasMissingPinnedItem}
                canAcceptSelectedRequest={
                  detailViewModel.canAcceptSelectedRequest
                }
                isAcceptingRequest={detailViewModel.isAcceptingRequest}
                canCloseSelectedRequest={detailViewModel.canCloseSelectedRequest}
                isClosingRequest={detailViewModel.isClosingRequest}
                canSendSelectedMessage={detailViewModel.canSendSelectedMessage}
                canEditSelectedReply={detailViewModel.canEditSelectedReply}
                isEditingSelectedReply={detailState.isEditingSelectedReply}
                canSubmitSelectedMessage={
                  detailViewModel.canSubmitSelectedMessage
                }
                isSendingMessage={detailViewModel.isSendingMessage}
                useRichMessageComposer={detailViewModel.useRichMessageComposer}
                messageDraft={detailState.messageDraft}
                messageContents={
                  detailState.isMentorChannel
                    ? detailState.messageContents
                    : undefined
                }
                messageDraftMetaLabel={detailViewModel.messageDraftMetaLabel}
                messagePlaceholder={detailViewModel.messagePlaceholder}
                sendButtonLabel={detailViewModel.sendButtonLabel}
                paidFollowupNoticeTitle={
                  detailViewModel.paidFollowupNotice?.title
                }
                paidFollowupNoticeDescription={
                  detailViewModel.paidFollowupNotice?.description
                }
                paidFollowupActionLabel={
                  detailViewModel.paidFollowupNotice?.actionLabel
                }
                paidFollowupActionHref={
                  detailViewModel.paidFollowupNotice?.actionHref
                }
                onActiveChannelChange={actions.setActiveChannel}
                onAcceptSelectedRequest={detailActions.onAcceptSelectedRequest}
                onCloseSelectedRequest={detailActions.onCloseSelectedRequest}
                onStartEditingSelectedReply={
                  detailActions.onStartEditingSelectedReply
                }
                onCancelEditingSelectedReply={
                  detailActions.onCancelEditingSelectedReply
                }
                onMessageDraftChange={detailActions.setMessageDraft}
                onMessageContentsChange={detailActions.setMessageContents}
                onSendSelectedMessage={detailActions.onSendSelectedMessage}
                onStatusFilterChange={actions.setStatusFilter}
                onSelectRequestId={actions.selectRequest}
                onBack={() => actions.selectRequest('')}
              />
            ) : (
              <NoteConsultationEmpty />
            )
          }
        />
      }
    />
  );
}
