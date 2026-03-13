import {
  type AuthUser,
  authResponseSchema,
  type LoginRequest,
  loginRequestSchema,
} from '@/features/auth/schema.ts';
import { createApiUrl, ensureSuccess, JSON_HEADERS } from '@/shared/api/http.ts';

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await fetch(createApiUrl('/api/auth/me'), {
    credentials: 'include',
    headers: JSON_HEADERS,
  });

  if (response.status === 401) {
    return null;
  }

  await ensureSuccess(response, 'ログイン状態の確認に失敗しました。');

  return authResponseSchema.parse(await response.json()).user;
};

export const login = async (input: LoginRequest) => {
  const payload = loginRequestSchema.parse(input);
  const response = await fetch(createApiUrl('/api/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  await ensureSuccess(response, 'ログインに失敗しました。');

  return authResponseSchema.parse(await response.json()).user;
};

export const logout = async () => {
  const response = await fetch(createApiUrl('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: JSON_HEADERS.Accept,
    },
  });

  await ensureSuccess(response, 'ログアウトに失敗しました。');
};
