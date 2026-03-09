import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useEffectEvent, useRef } from 'react';
import { authSessionQueryOptions } from '#/features/auth/hooks/useAuthSession.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';
import { UnauthorizedError } from '#/shared/api/http.ts';

export function AuthRedirectController() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isHandlingUnauthorizedRef = useRef(false);

  const handleUnauthorized = useEffectEvent(async () => {
    if (isHandlingUnauthorizedRef.current) {
      return;
    }

    isHandlingUnauthorizedRef.current = true;

    try {
      queryClient.setQueryData(authSessionQueryOptions().queryKey, null);
      queryClient.removeQueries({ queryKey: ticketsQueryKey.all });

      if (router.state.location.pathname !== '/') {
        await router.navigate({ to: '/' });
      }

      await router.invalidate();
    } finally {
      isHandlingUnauthorizedRef.current = false;
    }
  });

  useEffect(() => {
    const unsubscribeQueryCache = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') {
        return;
      }

      if (event.query.queryKey[0] === authSessionQueryOptions().queryKey[0]) {
        return;
      }

      if (event.query.state.error instanceof UnauthorizedError) {
        void handleUnauthorized();
      }
    });

    const unsubscribeMutationCache = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== 'updated') {
        return;
      }

      if (event.mutation.state.error instanceof UnauthorizedError) {
        void handleUnauthorized();
      }
    });

    return () => {
      unsubscribeQueryCache();
      unsubscribeMutationCache();
    };
  }, [queryClient]);

  return null;
}
