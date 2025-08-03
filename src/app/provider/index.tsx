import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import QueryProvider from '@/app/provider/query-provider';

interface ProviderProps {
  children: React.ReactNode;
}

function MainProvider({ children }: ProviderProps) {
  return (
    <QueryProvider>
      <Toaster
        position="top-center"
        icons={{
          success: null,
          error: null,
          info: null,
          warning: null,
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex flex-row-reverse items-center gap-150 font-designer-14m p-200 rounded-50 text-text-inverse shadow-[2px_2px_5px_#00000014]',
            info: 'bg-background-neutral-strong',
            success: 'bg-background-success-default',
            warning: 'bg-background-danger-default',
            closeButton: '!font-thin',
          },
        }}
        closeButton
      />
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryProvider>
  );
}

export default MainProvider;
