import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCurrentUser, login, logout } from './api.ts';

const user = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin User',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchCurrentUser', () => {
  it('maps an unauthenticated response to null', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCurrentUser()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/api/auth/me', {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  it('parses the authenticated user response', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ user }, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCurrentUser()).resolves.toEqual(user);
  });
});

describe('login', () => {
  it('normalizes the email before sending the request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ user }, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(login({ email: '  admin@example.com  ', password: 'secret' })).resolves.toEqual(
      user,
    );
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
    });
  });

  it('rejects invalid input before making a request', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(login({ email: 'invalid', password: '' })).rejects.toThrow(
      'メールアドレスの形式で入力してください',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('logout', () => {
  it('sends a credentialed POST without a request body', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  });
});
