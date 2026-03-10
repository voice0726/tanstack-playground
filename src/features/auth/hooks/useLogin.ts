import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { login } from '#/features/auth/api.ts';
import { authSessionQueryOptions } from '#/features/auth/hooks/useAuthSession.ts';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    retry: false,
    onSuccess: async (user) => {
      queryClient.setQueryData(authSessionQueryOptions().queryKey, user);
      await router.invalidate();
    },
  });
};
