import { initialize, mswLoader } from 'msw-storybook-addon';
import '../app/global.css';
import type { Preview } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// initialize MSW
initialize({
  onUnhandledRequest: (req, print) => {
    // supress warnings for requesting static assets
    const isStaticAssetRequest =
      /(public|assets)\/(.*?)\.|(svg|jpg|jpeg|png|webp)(\?.*)?$/g;

    if (isStaticAssetRequest.test(req.url)) {
      return;
    }
    print.warning();
  },
});

// test query client for not caching results
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: false,
    },
  },
});

const preview: Preview = {
  // mocking APIs of server interaction
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => {
      return (
        <QueryClientProvider client={testQueryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
