'use client';

import MentoringListTemplate from '@/components/mentoring/common/mentoring-list-template';
import MentoringStateBoundary from '@/components/mentoring/common/mentoring-state-boundary';
import {
  NoteConsultationContent,
  NoteConsultationEmptyState,
  NoteConsultationHeader,
} from '@/components/mentoring/note-consultation/note-consultation-composite';
import { useNoteConsultationController } from '@/features/mentoring/model/use-note-consultation-controller';

export default function NoteConsultationPage() {
  const { state, viewModel, actions } = useNoteConsultationController();

  return (
    <MentoringStateBoundary
      state={state.listState}
      loading={(
        <div className="flex flex-col gap-300">
          <div className="rounded-100 bg-background-alternative h-[40px] w-[200px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[660px] animate-pulse" />
        </div>
      )}
      error={(
        <div className="rounded-200 border border-border-subtle bg-background-default px-300 py-300 text-center">
          <p className="font-designer-16m text-text-default">{viewModel.errorMessage}</p>
        </div>
      )}
      ready={(
        <MentoringListTemplate
          toolbar={<NoteConsultationHeader />}
          content={
            viewModel.hasAnyRequest ? (
              <NoteConsultationContent
                activeChannel={state.activeChannel}
                searchKeyword={state.searchKeyword}
                filteredItems={viewModel.filteredItems}
                selectedRequestId={state.selectedRequestId}
                selectedItem={viewModel.selectedItem}
                draft={state.draft}
                canSend={viewModel.canSend}
                onActiveChannelChange={actions.setActiveChannel}
                onSearchKeywordChange={actions.setSearchKeyword}
                onSelectRequestId={actions.selectRequest}
                onDraftChange={actions.updateDraft}
                onSend={actions.sendMessage}
              />
            ) : (
              <NoteConsultationEmptyState />
            )
          }
        />
      )}
    />
  );
}
