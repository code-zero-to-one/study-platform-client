'use client';

import { resolveAdminMentoringViewState } from '@/features/admin/mentoring/model/admin-mentoring-view-state';
import { useSessionOperationsController } from '@/features/admin/mentoring/model/use-session-operations-controller';
import MentoringListTemplate from '@/features/mentoring/ui/common/mentoring-list-template';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import {
  SessionOperationsFilters,
  SessionOperationsGrid,
  SessionRequestList,
  SessionScheduleList,
} from './session-operations-composite';

interface SessionOperationsContainerProps {
  initialMentorId?: number;
}

export default function SessionOperationsContainer({
  initialMentorId,
}: SessionOperationsContainerProps) {
  const { state, viewModel, actions } = useSessionOperationsController({
    initialMentorId,
  });
  const listState = resolveAdminMentoringViewState({
    hasHydrated: state.hasHydrated,
    itemCount: state.mentors.length,
    emptyWhenNoData: false,
  });

  return (
    <MentoringStateBoundary
      state={listState}
      ready={
        <MentoringListTemplate
          toolbar={
            <SessionOperationsFilters
              mentors={state.mentors}
              selectedMentorId={state.selectedMentorId}
              pendingRequestCount={viewModel.summary.pendingRequestCount}
              onSelectMentorId={actions.selectMentorId}
            />
          }
          summary={
            <SessionOperationsGrid
              totalRequestCount={viewModel.summary.totalRequestCount}
              pendingRequestCount={viewModel.summary.pendingRequestCount}
              closedNoteCount={viewModel.summary.closedNoteCount}
              scheduledSessionCount={viewModel.summary.scheduledSessionCount}
              completedSessionCount={viewModel.summary.completedSessionCount}
            />
          }
          content={<SessionRequestList requestRows={viewModel.requestRows} />}
          secondaryContent={
            <SessionScheduleList sessionRows={viewModel.sessionRows} />
          }
        />
      }
    />
  );
}
