import { isServer, MutationCache, QueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError, logError } from '@/utils/error-handler';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // 개별 onError가 있으면 이미 처리된 것으로 간주
        if (mutation.options.onError) return;

        if (isServer) return;

        const errorInfo = analyzeError(error);
        useToastStore.getState().showToast(errorInfo.userMessage, 'error');
        logError(errorInfo, { source: 'MutationCache.onError' });
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();

    return browserQueryClient;
  }
}
