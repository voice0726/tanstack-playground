import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicketComment } from '@/features/tickets/api.ts';
import { ticketsQueryKey } from '@/features/tickets/queryKeys.ts';

export const useCreateTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketComment,
    onSuccess: async (ticket) => {
      queryClient.setQueryData(ticketsQueryKey.detail(ticket.id), ticket);
      await queryClient.invalidateQueries({ queryKey: ticketsQueryKey.lists() });
    },
  });
};
