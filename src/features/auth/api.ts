import {
  type AuthUser,
  authResponseSchema,
  type LoginRequest,
  loginRequestSchema,
} from '@/features/auth/schema.ts';
import {
  ensureSuccess,
  fetchApi,
  JSON_HEADERS,
  parseJsonResponse,
} from '@/shared/api/http.ts';

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await fetchApi(
    '/api/auth/me',
    {
      credentials: 'include',
      headers: JSON_HEADERS,
    },
    'ログイン状態の確認に失敗しました。',
  );

  if (response.status === 401) {
    return null;
  }

  await ensureSuccess(response, 'ログイン状態の確認に失敗しました。');

  return (await parseJsonResponse(response, '/api/auth/me', authResponseSchema.parse)).user;
};

export const login = async (input: LoginRequest) => {
  const payload = loginRequestSchema.parse(input);
  const response = await fetchApi(
    '/api/auth/login',
    {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    'ログインに失敗しました。',
  );

  await ensureSuccess(response, 'ログインに失敗しました。');

  return (await parseJsonResponse(response, '/api/auth/login', authResponseSchema.parse)).user;
};

export const logout = async () => {
  const response = await fetchApi(
    '/api/auth/logout',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: JSON_HEADERS.Accept,
      },
    },
    'ログアウトに失敗しました。',
  );

  await ensureSuccess(response, 'ログアウトに失敗しました。');
};
