import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { logout } from '#/features/auth/api.ts';
import { authSessionQueryOptions } from '#/features/auth/hooks/useAuthSession.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    retry: false,
    onSuccess: async () => {
      queryClient.setQueryData(authSessionQueryOptions().queryKey, null);
      queryClient.removeQueries({ queryKey: ticketsQueryKey.all });
      await router.invalidate();
    },
  });
};
