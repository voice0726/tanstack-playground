import { HttpResponse, http } from 'msw';
import { type TicketsSearch, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';

type Ticket = {
  id: string;
  title: string;
  status: 'open' | 'closed';
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
};

const TICKETS: Ticket[] = [
  {
    id: '1',
    title: 'Login bug',
    status: 'open',
    assignee: 'aki',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z',
  },
  {
    id: '2',
    title: 'Refactor filters',
    status: 'closed',
    assignee: null,
    createdAt: '2026-02-27T12:00:00Z',
    updatedAt: '2026-03-01T09:45:00Z',
  },
  {
    id: '3',
    title: 'Add pagination',
    status: 'open',
    assignee: 'mika',
    createdAt: '2026-03-02T09:30:00Z',
    updatedAt: '2026-03-04T08:20:00Z',
  },
];

const sortConfig: Record<
  TicketsSearch['sort'],
  { field: 'createdAt' | 'updatedAt'; order: 'asc' | 'dsc' }
> = {
  created_at_asc: { field: 'createdAt', order: 'asc' },
  created_at_dsc: { field: 'createdAt', order: 'dsc' },
  updated_at_asc: { field: 'updatedAt', order: 'asc' },
  updated_at_dsc: { field: 'updatedAt', order: 'dsc' },
};

export const listTickets = (tickets: Ticket[], search: TicketsSearch) => {
  const filtered = tickets.filter((ticket) => {
    if (search.status !== 'all' && ticket.status !== search.status) {
      return false;
    }

    if (search.q && !ticket.title.toLowerCase().includes(search.q.toLowerCase())) {
      return false;
    }

    return true;
  });

  const { field, order } = sortConfig[search.sort];
  const sorted = [...filtered].sort((a, b) => {
    const diff = Date.parse(a[field]) - Date.parse(b[field]);
    return order === 'asc' ? diff : -diff;
  });

  const total = sorted.length;
  const start = (search.page - 1) * search.pageSize;
  const end = start + search.pageSize;

  return {
    items: sorted.slice(start, end),
    total,
  };
};

export const handlers = [
  http.get('/api/tickets', ({ request }) => {
    const url = new URL(request.url);
    const search = ticketsSearchSchema.parse(Object.fromEntries(url.searchParams.entries()));
    const result = listTickets(TICKETS, search);

    return HttpResponse.json(result);
  }),
];
