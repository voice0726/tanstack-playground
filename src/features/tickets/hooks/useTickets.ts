import { useQuery } from '@tanstack/react-query';
import { ticketsQueryKey } from '#/features/tickets/queryKeys.ts';
import { type TicketsResponse, ticketsResponseSchema } from '#/features/tickets/schema/index.ts';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';
import { env } from '#/shared/config/env.ts';
import { withQuery } from '#/shared/utils/url.ts';

const TICKETS_STALE_TIME = 30_000;
const TICKETS_GC_TIME = 5 * 60_000;
const API_BASE_URL = env.VITE_API_BASE_URL;

async function fetchTickets(filters: TicketsSearch): Promise<TicketsResponse> {
  const url = `${API_BASE_URL}${withQuery('/api/tickets', filters)}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status}`);
  }

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
    staleTime: TICKETS_STALE_TIME,
    gcTime: TICKETS_GC_TIME,
  });
};
