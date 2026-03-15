'use client';

import { useNoteConsultationController } from '@/features/mentoring/model/use-note-consultation-controller';
import MentoringListTemplate from '@/features/mentoring/ui/common/mentoring-list-template';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import {
  NoteConsultationEmpty,
  NoteConsultationGrid,
  NoteConsultationHeader,
} from '@/features/mentoring/ui/note-consultation/note-consultation-composite';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';

interface NoteConsultationContainerProps {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
}

export default function NoteConsultationContainer({
  initialRequestId,
  initialChannel,
}: NoteConsultationContainerProps) {
  const { state, viewModel, actions } = useNoteConsultationController({
    initialRequestId,
    initialChannel,
  });

  return (
    <MentoringStateBoundary
      state={state.listState}
      loading={
        <div className="flex flex-col gap-300">
          <div className="rounded-100 bg-background-alternative h-[40px] w-[200px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[660px] animate-pulse" />
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
          toolbar={<NoteConsultationHeader />}
          content={
            viewModel.hasAnyRequest ? (
              <NoteConsultationGrid
                activeChannel={state.activeChannel}
                searchKeyword={state.searchKeyword}
                filteredItems={viewModel.filteredItems}
                itemStatusSummaries={viewModel.itemStatusSummaries}
                activeChannelSummaryItems={viewModel.activeChannelSummaryItems}
                selectedRequestId={state.selectedRequestId}
                selectedItem={viewModel.selectedItem}
                pinnedItem={viewModel.pinnedItem}
                pinnedItemStatusSummary={viewModel.pinnedItemStatusSummary}
                isRestoringPinnedItem={viewModel.isRestoringPinnedItem}
                hasMissingPinnedItem={viewModel.hasMissingPinnedItem}
                draft={state.draft}
                canSend={viewModel.canSend}
                onActiveChannelChange={actions.setActiveChannel}
                onSearchKeywordChange={actions.setSearchKeyword}
                onSelectRequestId={actions.selectRequest}
                onDraftChange={actions.updateDraft}
                onSend={actions.sendMessage}
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
