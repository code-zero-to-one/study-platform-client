export type AdminMentoringViewState = 'loading' | 'empty' | 'ready';

interface ResolveAdminMentoringViewStateParams {
  hasHydrated: boolean;
  itemCount: number;
  emptyWhenNoData?: boolean;
}

export const resolveAdminMentoringViewState = ({
  hasHydrated,
  itemCount,
  emptyWhenNoData = true,
}: ResolveAdminMentoringViewStateParams): AdminMentoringViewState => {
  if (!hasHydrated) {
    return 'loading';
  }

  if (emptyWhenNoData && itemCount === 0) {
    return 'empty';
  }

  return 'ready';
};
