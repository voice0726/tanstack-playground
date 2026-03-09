import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { env } from '#/shared/config/env.ts';
import { createRouter } from '@/router';

const queryClient = new QueryClient();
const router = createRouter(queryClient);

const rootElement = document.getElementById('app');

async function enableMocking() {
  if (!env.DEV) {
    return;
  }

  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

async function bootstrap() {
  if (!rootElement || rootElement.innerHTML) {
    return;
  }

  await enableMocking();
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

void bootstrap();
