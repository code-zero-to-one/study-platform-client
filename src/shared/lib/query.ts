import {
  QueryClient,
  dehydrate,
  DefaultError,
  FetchQueryOptions,
} from '@tanstack/react-query';

// SSR을 위한 함수
export async function getDehydratedState(
  options: FetchQueryOptions<unknown, DefaultError, unknown, unknown[]>,
) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(options);

  return {
    dehydratedState: dehydrate(queryClient),
  };
}
