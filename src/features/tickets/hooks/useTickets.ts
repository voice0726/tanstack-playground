import { useQuery } from '@tanstack/react-query';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';
import { type TicketsResponse, ticketsResponseSchema } from '#/features/tickets/schema/index.ts';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';
import { withQuery } from '#/shared/utils/url.ts';

async function fetchTickets(filters?: TicketsSearch): Promise<TicketsResponse> {
  const url = withQuery('/api/tickets', filters);
  const response = await fetch(url);
  const data = await response.json();

  return ticketsResponseSchema.parse(data);
}

export type UseTicketsOptions = {
  filters: TicketsSearch;
};

export const useTickets = (opts: UseTicketsOptions) => {
  const { filters } = opts;

  return useQuery<TicketsResponse>({
    queryKey: ticketsQueryKey.list(filters),
    queryFn: () => fetchTickets(filters),
  });
};
