import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/features/auth/api.ts';
import { authQueryKey } from '@/features/auth/queryKeys.ts';

const AUTH_SESSION_STALE_TIME = 60_000;
const AUTH_SESSION_GC_TIME = 5 * 60_000;

export const authSessionQueryOptions = () =>
  queryOptions({
    queryKey: authQueryKey.session(),
    queryFn: fetchCurrentUser,
    staleTime: AUTH_SESSION_STALE_TIME,
    gcTime: AUTH_SESSION_GC_TIME,
    retry: false,
  });

export const useAuthSession = () => useQuery(authSessionQueryOptions());
