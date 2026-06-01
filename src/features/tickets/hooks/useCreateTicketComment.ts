import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicketComment } from '@/features/tickets/api.ts';
import { updateTicketDetailCache } from '@/features/tickets/queryKeys.ts';

export const useCreateTicketComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketComment,
    onSuccess: (ticket) => updateTicketDetailCache(queryClient, ticket),
  });
};
