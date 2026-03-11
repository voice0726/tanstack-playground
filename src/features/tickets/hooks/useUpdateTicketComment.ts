import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicketComment } from '#/features/tickets/api.ts';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';

export const useUpdateTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketComment,
    onSuccess: async (ticket) => {
      queryClient.setQueryData(ticketsQueryKey.detail(ticket.id), ticket);
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
