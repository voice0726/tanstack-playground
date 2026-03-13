import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicket } from '@/features/tickets/api.ts';
import { updateTicketDetailCache } from '@/features/tickets/queryKeys.ts';

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicket,
    onSuccess: (ticket) => updateTicketDetailCache(queryClient, ticket),
  });
};
