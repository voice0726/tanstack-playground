import { useQuery } from '@tanstack/react-query';
import { fetchTicket } from '@/features/tickets/api.ts';
import { ticketsQueryKey } from '@/features/tickets/queryKeys.ts';
import type { Ticket } from '@/features/tickets/schema/index.ts';

const TICKET_STALE_TIME = 30_000;
const TICKET_GC_TIME = 5 * 60_000;

export type UseTicketOptions = {
  id: Ticket['id'];
};

export const useTicket = ({ id }: UseTicketOptions) => {
  return useQuery({
    queryKey: ticketsQueryKey.detail(id),
    queryFn: () => fetchTicket(id),
    staleTime: TICKET_STALE_TIME,
    gcTime: TICKET_GC_TIME,
  });
};
