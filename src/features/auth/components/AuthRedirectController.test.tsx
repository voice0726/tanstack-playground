import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRedirectController } from '@/features/auth/components/AuthRedirectController.tsx';
import { authQueryKey } from '@/features/auth/queryKeys.ts';
import { HttpError, UnauthorizedError } from '@/shared/api/http.ts';

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

  it('handles unauthorized mutations with the same session reset and redirect', async () => {
    const client = createClient();
    client.setQueryData(authQueryKey.session(), { id: 1 });
    render(<AuthRedirectController />, { wrapper: wrapper(client) });

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(new UnauthorizedError()) })
      .execute(undefined)
      .catch(() => undefined);

    await waitFor(() => expect(client.getQueryData(authQueryKey.session())).toBeNull());
    expect(router.navigate).toHaveBeenCalledWith({ to: '/' });
    expect(router.invalidate).toHaveBeenCalledTimes(1);
  });

  it('ignores non-401 failures and session-query unauthorized failures', async () => {
    const client = createClient();
    const session = { id: 1 };
    client.setQueryData(authQueryKey.session(), session);
    render(<AuthRedirectController />, { wrapper: wrapper(client) });

    await client
      .fetchQuery({
        queryKey: ['tickets'],
        queryFn: () => Promise.reject(new HttpError('server error', 500)),
        retry: false,
      })
      .catch(() => undefined);
    await client
      .fetchQuery({
        queryKey: authQueryKey.session(),
        queryFn: () => Promise.reject(new UnauthorizedError()),
        retry: false,
      })
      .catch(() => undefined);

    expect(client.getQueryData(authQueryKey.session())).toEqual(session);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.invalidate).not.toHaveBeenCalled();
  });

});
