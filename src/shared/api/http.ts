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
} satisfies Record<string, string>;

export const createApiUrl = (path: string) => `${env.VITE_API_BASE_URL}${path}`;

const hasMessageField = (body: unknown): body is { message: string } =>
  typeof body === 'object' &&
  body !== null &&
  'message' in body &&
  typeof (body as Record<string, unknown>).message === 'string';

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body: unknown = await response.json();
      if (hasMessageField(body) && body.message.trim() !== '') {
        return body.message;
      }
      return fallback;
    }

    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
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
