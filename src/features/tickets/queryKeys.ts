import type { TicketsSearch } from '#/features/tickets/schema/search.ts';

export const ticketsQueryKey = {
  all: ['tickets'] as const,
  lists: () => [...ticketsQueryKey.all, 'list'] as const,
  list: (filter: TicketsSearch) => [...ticketsQueryKey.all, 'list', filter] as const,
  details: () => [...ticketsQueryKey.all, 'detail'] as const,
  detail: (id: string) => [...ticketsQueryKey.all, 'detail', id] as const,
};
