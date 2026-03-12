import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '@/features/tickets/api.ts';
import { ticketsQueryKey } from '@/features/tickets/queryKeys.ts';
import type { TicketsResponse } from '@/features/tickets/schema/index.ts';
import type { TicketsSearch } from '@/features/tickets/schema/search.ts';

const TICKETS_STALE_TIME = 30_000;
const TICKETS_GC_TIME = 5 * 60_000;

export type UseTicketsOptions = {
  filters: TicketsSearch;
};

export const useTickets = (opts: UseTicketsOptions) => {
  const { filters } = opts;

  return useQuery<TicketsResponse>({
    queryKey: ticketsQueryKey.list(filters),
    queryFn: () => fetchTickets(filters),
    staleTime: TICKETS_STALE_TIME,
    gcTime: TICKETS_GC_TIME,
  });
};
