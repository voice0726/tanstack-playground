import { env } from '@/shared/config/env.ts';

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = '認証が必要です。') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

export const createApiUrl = (path: string) => `${env.VITE_API_BASE_URL}${path}`;

const readErrorMessage = async (response: Response, fallback: string) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const body = await response.json();
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string' &&
        body.message.trim() !== ''
      ) {
        return body.message;
      }
    } catch {
      // Ignore JSON parse errors and fall back to text below.
    }
  }

  try {
    const text = (await response.text()).trim();
    if (text !== '') {
      return text;
    }
  } catch {
    // Ignore body read errors and fall back to the caller-provided message.
  }

  return fallback;
};

export const ensureSuccess = async (response: Response, fallbackMessage: string) => {
  if (response.ok) {
    return;
  }

  const message = await readErrorMessage(response, fallbackMessage);

  if (response.status === 401) {
    throw new UnauthorizedError(message);
  }

  throw new HttpError(message, response.status);
};
