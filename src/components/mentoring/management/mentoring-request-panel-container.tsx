'use client';

import { useMentoringRequestPanelController } from '@/features/mentoring/model/use-mentoring-request-panel-controller';
import type { MentoringRequestPanelProps } from '@/types/mentoring/management-view';
import MentoringRequestDetailCard from './mentoring-request-detail-card';
import MentoringRequestEmpty from './mentoring-request-empty';
import MentoringRequestHeader from './mentoring-request-header';
import MentoringRequestList from './mentoring-request-list';
import MentoringRequestUrgentBanner from './mentoring-request-urgent-banner';

export default function MentoringRequestPanelContainer({
  mentorId,
  methodDurations,
  initialExpandedId: _initialExpandedId,
  filterRequestId,
}: MentoringRequestPanelProps) {
  const { state, actions, viewModel } = useMentoringRequestPanelController({
    mentorId,
    filterRequestId,
  });

  return (
    <>
      {viewModel.showUrgentBanner ? (
        <MentoringRequestUrgentBanner urgentCount={state.urgentCount} />
      ) : null}

      {state.mode !== 'detail' ? (
        <MentoringRequestHeader title={viewModel.titleText} />
      ) : null}

      {state.mode === 'empty' ? (
        <MentoringRequestEmpty />
      ) : null}

      {state.mode === 'detail' && state.detailRequest ? (
        <MentoringRequestDetailCard
          request={state.detailRequest}
          mentorId={mentorId}
          methodDurations={methodDurations}
        />
      ) : null}

      {state.mode === 'list' ? (
        <MentoringRequestList rows={viewModel.rows} actions={actions} />
      ) : null}
    </>
  );
}
