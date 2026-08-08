import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authQueryKey } from '@/features/auth/queryKeys.ts';

const router = vi.hoisted(() => ({
  invalidate: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));
const api = vi.hoisted(() => ({
  fetchCurrentUser: vi
    .fn<() => Promise<{ id: number; email: string; displayName: string } | null>>(),
  login: vi.fn<
    (input: { email: string; password: string }) => Promise<{
      id: number;
      email: string;
      displayName: string;
    }>
  >(),
  logout: vi.fn<() => Promise<void>>(),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: () => router,
}));
vi.mock('@/features/auth/api.ts', () => api);

import { useAuthSession } from '@/features/auth/hooks/useAuthSession.ts';
import { useLogin } from '@/features/auth/hooks/useLogin.ts';
import { useLogout } from '@/features/auth/hooks/useLogout.ts';

const user = { id: 1, email: 'aki@example.com', displayName: 'Aki' };
const createClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
const wrapper = (client: QueryClient) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth hooks', () => {
  it('loads the session without query retries', async () => {
    const client = createClient();
    api.fetchCurrentUser.mockResolvedValue(user);
    const Probe = () => {
      const session = useAuthSession();
      return <output>{session.data?.displayName ?? 'loading'}</output>;
    };

    render(<Probe />, { wrapper: wrapper(client) });

    await screen.findByText('Aki');
    expect(api.fetchCurrentUser).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(authQueryKey.session())).toEqual(user);
  });

  it('stores the user and invalidates the router after login', async () => {
    const client = createClient();
    api.login.mockResolvedValue(user);
    const Probe = () => {
      const login = useLogin();
      return <button onClick={() => login.mutate({ email: user.email, password: 'secret' })}>login</button>;
    };

    render(<Probe />, { wrapper: wrapper(client) });
    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => expect(client.getQueryData(authQueryKey.session())).toEqual(user));
    expect(router.invalidate).toHaveBeenCalledTimes(1);
  });

  it('clears non-auth cache entries and preserves auth entries after logout', async () => {
    const client = createClient();
    client.setQueryData(authQueryKey.session(), user);
    client.setQueryData(['auth', 'other'], 'keep');
    client.setQueryData(['tickets'], 'remove');
    api.logout.mockResolvedValue(undefined);
    const Probe = () => {
      const logout = useLogout();
      return <button onClick={() => logout.mutate()}>logout</button>;
    };

    render(<Probe />, { wrapper: wrapper(client) });
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(client.getQueryData(authQueryKey.session())).toBeNull());
    expect(client.getQueryData(['tickets'])).toBeUndefined();
    expect(client.getQueryData(['auth', 'other'])).toBe('keep');
    expect(router.invalidate).toHaveBeenCalledTimes(1);
  });
});
