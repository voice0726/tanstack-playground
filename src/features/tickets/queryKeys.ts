import type { TicketsSearch } from '#/features/tickets/schema/search.ts';

export const ticketsQueryKey = {
  all: ['tickets'],
  lists: () => [...ticketsQueryKey.all, 'list'],
  list: (filter: TicketsSearch) => [...ticketsQueryKey.all, 'list', filter],
  details: () => [...ticketsQueryKey.all, 'detail'],
  detail: (id: string) => [...ticketsQueryKey.all, 'detail', id],
};
