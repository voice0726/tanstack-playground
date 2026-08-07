import { describe, expect, it } from 'vitest';
import { createApiUrl, ensureSuccess, HttpError, UnauthorizedError } from './http.ts';

describe('ensureSuccess', () => {
  it('allows successful responses', async () => {
    await expect(ensureSuccess(new Response(null, { status: 204 }), 'fallback')).resolves.toBeUndefined();
  });

  it('uses a JSON message when available', async () => {
    await expect(
      ensureSuccess(
        new Response(JSON.stringify({ message: 'invalid request' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
        'fallback',
      ),
    ).rejects.toMatchObject({ name: 'HttpError', message: 'invalid request', status: 400 });
  });

  it('uses plain text responses', async () => {
    await expect(
      ensureSuccess(new Response('service unavailable', { status: 503 }), 'fallback'),
    ).rejects.toMatchObject({ message: 'service unavailable', status: 503 });
  });

  it('uses the fallback for empty or malformed error bodies', async () => {
    await expect(ensureSuccess(new Response('', { status: 500 }), 'fallback')).rejects.toMatchObject({
      message: 'fallback',
      status: 500,
    });
    await expect(
      ensureSuccess(
        new Response('{malformed', {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }),
        'fallback',
      ),
    ).rejects.toMatchObject({ message: 'fallback', status: 500 });
  });

  it('returns UnauthorizedError for 401 responses', async () => {
    await expect(
      ensureSuccess(
        new Response(JSON.stringify({ message: 'authentication required' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
        'fallback',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('returns HttpError for non-401 failures', async () => {
    await expect(ensureSuccess(new Response(null, { status: 422 }), 'fallback')).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});

describe('createApiUrl', () => {
  it('joins the configured API base URL and path', () => {
    expect(createApiUrl('/api/health')).toBe('http://localhost:8787/api/health');
  });
});
