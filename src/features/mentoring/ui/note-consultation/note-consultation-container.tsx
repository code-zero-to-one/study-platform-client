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
  lockedChannel?: NoteConsultationChannel;
  statusTabPreset?: 'mentor' | 'mentee' | 'none';
  hideToolbar?: boolean;
}
export default function NoteConsultationContainer({
  initialRequestId,
  initialChannel,
  lockedChannel,
  statusTabPreset = 'none',
  hideToolbar = false,
}: NoteConsultationContainerProps) {
  const { state, viewModel, actions } = useNoteConsultationController({
    initialRequestId,
    initialChannel,
    lockedChannel,
    statusTabPreset,
  });

  return (
    <MentoringStateBoundary
      state={state.listState}
      loading={
        <div className="flex flex-col gap-300">
          {' '}
          {hideToolbar ? null : (
            <div className="h-[40px] w-[200px] rounded-100 bg-background-alternative animate-pulse" />
          )}{' '}
          <div className="h-[clamp(640px,calc(100dvh-220px),780px)] rounded-200 bg-background-alternative animate-pulse" />{' '}
        </div>
      }
      error={
        <div className="rounded-200 border-border-subtle bg-background-default border px-300 py-300 text-center">
          {' '}
          <p className="font-designer-16m text-text-default">
            {' '}
            {viewModel.errorMessage}{' '}
          </p>{' '}
        </div>
      }
      ready={
        <MentoringListTemplate
          toolbar={hideToolbar ? undefined : <NoteConsultationHeader />}
          content={
            viewModel.hasAnyRequest ? (
              <NoteConsultationGrid
                activeChannel={state.activeChannel}
                statusFilter={state.statusFilter}
                statusTabs={viewModel.statusTabs}
                showChannelTabs={!lockedChannel}
                filteredItems={viewModel.filteredItems}
                itemStatusSummaries={viewModel.itemStatusSummaries}
                selectedRequestId={state.selectedRequestId}
                selectedItem={viewModel.selectedItem}
                isRestoringPinnedItem={viewModel.isRestoringPinnedItem}
                hasMissingPinnedItem={viewModel.hasMissingPinnedItem}
                onActiveChannelChange={actions.setActiveChannel}
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
