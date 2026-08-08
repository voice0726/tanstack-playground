import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRedirectController } from '@/features/auth/components/AuthRedirectController.tsx';
import { authQueryKey } from '@/features/auth/queryKeys.ts';
import { UnauthorizedError } from '@/shared/api/http.ts';

const router = vi.hoisted(() => ({
  invalidate: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  navigate: vi.fn<(options: { to: string }) => Promise<void>>().mockResolvedValue(undefined),
  state: { location: { pathname: '/tickets' } },
}));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: () => router,
}));

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const wrapper = (client: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

beforeEach(() => {
  vi.clearAllMocks();
  router.state.location.pathname = '/tickets';
});

describe('AuthRedirectController', () => {
  it('clears session and non-auth cache then redirects for an unauthorized query', async () => {
    const client = createClient();
    client.setQueryData(authQueryKey.session(), { id: 1 });
    client.setQueryData(['tickets'], 'cached');
    render(<AuthRedirectController />, { wrapper: wrapper(client) });

    await client.fetchQuery({
      queryKey: ['ticket', 1],
      queryFn: () => Promise.reject(new UnauthorizedError()),
      retry: false,
    }).catch(() => undefined);

    await waitFor(() => expect(client.getQueryData(authQueryKey.session())).toBeNull());
    expect(client.getQueryData(['tickets'])).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith({ to: '/' });
    expect(router.invalidate).toHaveBeenCalledTimes(1);
  });
});
