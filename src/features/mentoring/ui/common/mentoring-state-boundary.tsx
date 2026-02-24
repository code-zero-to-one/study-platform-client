import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import ListStateBoundary, {
  type ListUiState,
} from '@/components/ui/list/list-state-boundary';

interface MentoringStateBoundaryProps {
  state: ListUiState;
  ready: React.ReactNode;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  error?: React.ReactNode;
  forbidden?: React.ReactNode;
  loadingClassName?: string;
}

function DefaultMentoringLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-200 bg-background-alternative h-[360px] animate-pulse',
        className,
      )}
    />
  );
}

export default function MentoringStateBoundary({
  state,
  ready,
  loading,
  empty,
  error,
  forbidden,
  loadingClassName,
}: MentoringStateBoundaryProps) {
  return (
    <ListStateBoundary
      state={state}
      ready={ready}
      loading={loading ?? <DefaultMentoringLoading className={loadingClassName} />}
      empty={empty}
      error={error}
      forbidden={forbidden}
    />
  );
}
