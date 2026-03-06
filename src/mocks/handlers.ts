import { delay, HttpResponse, http } from 'msw';
import {
  CreateTicketRequest,
  type CreateTicketRequest as CreateTicketRequestType,
  UpdateTicketRequest,
  type UpdateTicketRequest as UpdateTicketRequestType,
} from '#/features/tickets/schema/index.ts';
import { type TicketsSearch, ticketsSearchSchema } from '@/features/tickets/schema/search.ts';

type Ticket = {
  id: number;
  title: string;
  status: 'open' | 'closed';
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
};

const BASE_TICKETS: Ticket[] = [
  {
    id: 1,
    title: 'Login bug',
    status: 'open',
    assignee: 'aki',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z',
  },
  {
    id: 2,
    title: 'Refactor filters',
    status: 'closed',
    assignee: null,
    createdAt: '2026-02-27T12:00:00Z',
    updatedAt: '2026-03-01T09:45:00Z',
  },
  {
    id: 3,
    title: 'Add pagination',
    status: 'open',
    assignee: 'mika',
    createdAt: '2026-03-02T09:30:00Z',
    updatedAt: '2026-03-04T08:20:00Z',
  },
];

const ASSIGNEES = ['aki', 'mika', 'sora', 'nao'] as const;

const GENERATED_TICKETS: Ticket[] = Array.from({ length: 37 }, (_, index) => {
  const ticketNumber = index + 4;
  const createdAt = new Date(Date.UTC(2026, 0, 1, 0, 0, 0) + index * 8 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + ((index % 6) + 1) * 3 * 60 * 60 * 1000);
  const titlePrefix = ['Bugfix', 'Feature', 'Refactor', 'Ops'][index % 4];

  return {
    id: ticketNumber,
    title: `${titlePrefix} task #${ticketNumber}`,
    status: index % 3 === 0 ? 'closed' : 'open',
    assignee: index % 5 === 0 ? null : ASSIGNEES[index % ASSIGNEES.length],
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
});

const createTicketStore = () => [...BASE_TICKETS, ...GENERATED_TICKETS];

const ticketsStore: Ticket[] = createTicketStore();

const sortFieldConfig: Record<TicketsSearch['sortBy'], 'id' | 'createdAt' | 'updatedAt'> = {
  id: 'id',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
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

  const field = sortFieldConfig[search.sortBy];
  const sorted = [...filtered].sort((a, b) => {
    const diff = field === 'id' ? a.id - b.id : Date.parse(a[field]) - Date.parse(b[field]);
    return search.sortOrder === 'asc' ? diff : -diff;
  });

  const total = sorted.length;
  const start = (search.page - 1) * search.pageSize;
  const end = start + search.pageSize;

  return {
    items: sorted.slice(start, end),
    total,
  };
};

export const getTicketById = (tickets: Ticket[], id: Ticket['id']) =>
  tickets.find((ticket) => ticket.id === id);

export const createTicketItem = (
  tickets: Ticket[],
  input: CreateTicketRequestType,
  now: string,
): Ticket => {
  const nextId = tickets.reduce((maxId, ticket) => Math.max(maxId, ticket.id), 0) + 1;
  const ticket: Ticket = {
    id: nextId,
    title: input.title,
    status: input.status,
    assignee: input.assignee ?? null,
    createdAt: now,
    updatedAt: now,
  };

  tickets.unshift(ticket);

  return ticket;
};

export const updateTicketItem = (
  tickets: Ticket[],
  input: UpdateTicketRequestType,
  now: string,
): Ticket | null => {
  const ticket = tickets.find((item) => item.id === input.id);

  if (!ticket) {
    return null;
  }

  ticket.title = input.title;
  ticket.status = input.status;
  ticket.assignee = input.assignee ?? null;
  ticket.updatedAt = now;

  return ticket;
};

export const deleteTicketItem = (tickets: Ticket[], id: Ticket['id']) => {
  const index = tickets.findIndex((ticket) => ticket.id === id);

  if (index < 0) {
    return null;
  }

  const [removedTicket] = tickets.splice(index, 1);

  return removedTicket;
};

const MOCK_DELAY_MS = 1500;
const parseTicketId = (value: string | readonly string[] | undefined) => {
  if (Array.isArray(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) ? id : null;
};

export const handlers = [
  http.get('/api/tickets', async ({ request }) => {
    await delay(MOCK_DELAY_MS);

    const url = new URL(request.url);
    const search = ticketsSearchSchema.parse(Object.fromEntries(url.searchParams.entries()));
    const result = listTickets(ticketsStore, search);

    return HttpResponse.json(result);
  }),
  http.get('/api/tickets/:id', async ({ params }) => {
    await delay(MOCK_DELAY_MS);

    const id = parseTicketId(params.id);

    if (id === null) {
      return HttpResponse.json({ message: 'Invalid ticket id' }, { status: 400 });
    }

    const ticket = getTicketById(ticketsStore, id);

    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json(ticket);
  }),
  http.post('/api/tickets', async ({ request }) => {
    await delay(MOCK_DELAY_MS);

    const body = CreateTicketRequest.parse(await request.json());
    const now = new Date().toISOString();
    const ticket = createTicketItem(ticketsStore, body, now);

    return HttpResponse.json(ticket, { status: 201 });
  }),
  http.put('/api/tickets/:id', async ({ params, request }) => {
    await delay(MOCK_DELAY_MS);

    const id = parseTicketId(params.id);

    if (id === null) {
      return HttpResponse.json({ message: 'Invalid ticket id' }, { status: 400 });
    }

    const body = UpdateTicketRequest.parse(await request.json());

    if (body.id !== id) {
      return HttpResponse.json({ message: 'Ticket id mismatch' }, { status: 400 });
    }

    const ticket = updateTicketItem(ticketsStore, body, new Date().toISOString());

    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json(ticket);
  }),
  http.delete('/api/tickets/:id', async ({ params }) => {
    await delay(MOCK_DELAY_MS);

    const id = parseTicketId(params.id);

    if (id === null) {
      return HttpResponse.json({ message: 'Invalid ticket id' }, { status: 400 });
    }

    const removedTicket = deleteTicketItem(ticketsStore, id);

    if (!removedTicket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json({ id: removedTicket.id });
  }),
];
