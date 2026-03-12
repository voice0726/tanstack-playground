import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTicketComment } from '@/features/tickets/api.ts';
import { ticketsQueryKey } from '@/features/tickets/queryKeys.ts';

export const useDeleteTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicketComment,
    onSuccess: async (ticket) => {
      queryClient.setQueryData(ticketsQueryKey.detail(ticket.id), ticket);
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
