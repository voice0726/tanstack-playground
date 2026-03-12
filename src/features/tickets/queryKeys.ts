import type { Ticket } from '@/features/tickets/schema/index.ts';
import type { TicketsSearch } from '@/features/tickets/schema/search.ts';

export const ticketsQueryKey = {
  all: ['tickets'] as const,
  lists: () => [...ticketsQueryKey.all, 'list'] as const,
  list: (filter: TicketsSearch) => [...ticketsQueryKey.all, 'list', filter] as const,
  details: () => [...ticketsQueryKey.all, 'detail'] as const,
  detail: (id: Ticket['id']) => [...ticketsQueryKey.all, 'detail', id] as const,
};
