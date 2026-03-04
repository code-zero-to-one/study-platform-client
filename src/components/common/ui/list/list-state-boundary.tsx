import { type ReactNode } from 'react';

export type ListUiState = 'ready' | 'loading' | 'empty' | 'error' | 'forbidden';

interface ListStateBoundaryProps {
  state: ListUiState;
  ready: ReactNode;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  forbidden?: ReactNode;
}

export default function ListStateBoundary({
  state,
  ready,
  loading,
  empty,
  error,
  forbidden,
}: ListStateBoundaryProps) {
  if (state === 'loading') {
    return <>{loading}</>;
  }

  if (state === 'empty') {
    return <>{empty}</>;
  }

  if (state === 'error') {
    return <>{error}</>;
  }

  if (state === 'forbidden') {
    return <>{forbidden}</>;
  }

  return <>{ready}</>;
}
