import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTicket } from '#/features/tickets/api.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: async ({ id }) => {
      queryClient.removeQueries({ queryKey: ticketsQueryKey.detail(id) });
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
