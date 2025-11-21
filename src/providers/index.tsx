import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import QueryProvider from '@/providers/query-provider';

interface ProviderProps {
  children: React.ReactNode;
}

function MainProvider({ children }: ProviderProps) {
  return (
    <QueryProvider>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryProvider>
  );
}

export default MainProvider;
