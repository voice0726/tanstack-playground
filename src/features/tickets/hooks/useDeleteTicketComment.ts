import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTicketComment } from '@/features/tickets/api.ts';
import { updateTicketDetailCache } from '@/features/tickets/queryKeys.ts';

export const useDeleteTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicketComment,
    onSuccess: (ticket) => updateTicketDetailCache(queryClient, ticket),
  });
};
