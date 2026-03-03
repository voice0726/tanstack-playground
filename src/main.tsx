import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app');

async function enableMocking() {
  if (!import.meta.env.DEV) {
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
  root.render(<RouterProvider router={router} />);
}

void bootstrap();
