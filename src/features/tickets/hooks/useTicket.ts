import { useQuery } from '@tanstack/react-query';
import { fetchTicket } from '@/features/tickets/api.ts';
import {
  TICKETS_GC_TIME,
  TICKETS_STALE_TIME,
  ticketsQueryKey,
} from '@/features/tickets/queryKeys.ts';
import type { Ticket } from '@/features/tickets/schema/index.ts';

export type UseTicketOptions = {
  id: Ticket['id'];
};

export const useTicket = ({ id }: UseTicketOptions) => {
  return useQuery({
    queryKey: ticketsQueryKey.detail(id),
    queryFn: () => fetchTicket(id),
    staleTime: TICKETS_STALE_TIME,
    gcTime: TICKETS_GC_TIME,
  });
};
