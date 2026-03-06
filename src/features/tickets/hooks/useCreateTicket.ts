import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '#/features/tickets/api.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: async (ticket) => {
      queryClient.setQueryData(ticketsQueryKey.detail(ticket.id), ticket);
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
