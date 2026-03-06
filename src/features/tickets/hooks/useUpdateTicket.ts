import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicket } from '#/features/tickets/api.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicket,
    onSuccess: async (ticket) => {
      queryClient.setQueryData(ticketsQueryKey.detail(ticket.id), ticket);
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
