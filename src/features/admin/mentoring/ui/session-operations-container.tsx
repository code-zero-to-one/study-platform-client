'use client';

import MentoringStateBoundary from '@/components/mentoring/common/mentoring-state-boundary';
import { useSessionOperationsController } from '@/features/admin/mentoring/model/use-session-operations-controller';
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

  return (
    <MentoringStateBoundary
      state={state.hasHydrated ? 'ready' : 'loading'}
      ready={(
        <div className="flex flex-col gap-200">
          <SessionOperationsFilters
            mentors={state.mentors}
            selectedMentorId={state.selectedMentorId}
            readyToProcessCount={viewModel.summary.readyToProcessCount}
            onSelectMentorId={actions.selectMentorId}
          />

          <SessionOperationsGrid
            totalRequestCount={viewModel.summary.totalRequestCount}
            pendingPaymentCount={viewModel.summary.pendingPaymentCount}
            confirmedPaymentCount={viewModel.summary.confirmedPaymentCount}
            scheduledSessionCount={viewModel.summary.scheduledSessionCount}
          />

          <SessionRequestList requestRows={viewModel.requestRows} />

          <SessionScheduleList sessionRows={viewModel.sessionRows} />
        </div>
      )}
    />
  );
}
