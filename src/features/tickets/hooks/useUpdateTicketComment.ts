import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicketComment } from '@/features/tickets/api.ts';
import { updateTicketDetailCache } from '@/features/tickets/queryKeys.ts';

export const useUpdateTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketComment,
    onSuccess: (ticket) => updateTicketDetailCache(queryClient, ticket),
  });
};
