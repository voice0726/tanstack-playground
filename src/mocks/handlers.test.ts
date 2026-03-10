import { describe, expect, it } from 'vitest';
import { ticketActorSchema } from '#/features/tickets/schema/index.ts';
import { type TicketsSearch, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';
import { createTicketItem, deleteTicketItem, listTickets, updateTicketItem } from './handlers';

type MockTicket = Parameters<typeof listTickets>[0][number];

const createEmptyHistory = () => ({ items: [] });
const TICKET_CREATOR = ticketActorSchema.parse({
  id: 11,
  email: 'creator@example.com',
  displayName: 'Creator User',
});
const TICKET_EDITOR = ticketActorSchema.parse({
  id: 12,
  email: 'editor@example.com',
  displayName: 'Editor User',
});
const TICKET_ADMIN = ticketActorSchema.parse({
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin User',
});

const TICKETS: MockTicket[] = [
  {
    id: 1,
    title: 'Login bug',
    status: 'open',
    assignee: 'aki',
    createdBy: TICKET_CREATOR,
    updatedBy: TICKET_EDITOR,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z',
    history: createEmptyHistory(),
  },
  {
    id: 2,
    title: 'Refactor filters',
    status: 'closed',
    assignee: null,
    createdBy: TICKET_CREATOR,
    updatedBy: TICKET_CREATOR,
    createdAt: '2026-02-27T12:00:00Z',
    updatedAt: '2026-03-01T09:45:00Z',
    history: createEmptyHistory(),
  },
  {
    id: 3,
    title: 'Add pagination',
    status: 'open',
    assignee: 'mika',
    createdBy: TICKET_EDITOR,
    updatedBy: TICKET_ADMIN,
    createdAt: '2026-03-02T09:30:00Z',
    updatedAt: '2026-03-04T08:20:00Z',
    history: createEmptyHistory(),
  },
];

const parseSearch = (input: Record<string, string>): TicketsSearch =>
  ticketsSearchSchema.parse(input);

describe('listTickets', () => {
  it('filters by q and status', () => {
    const result = listTickets(
      TICKETS,
      parseSearch({
        q: 'refactor',
        status: 'closed',
        sortBy: 'created_at',
        sortOrder: 'dsc',
        page: '1',
        pageSize: '10',
      }),
    );

    expect(result.total).toBe(1);
    expect(result.items.map((ticket) => ticket.id)).toEqual([2]);
  });

  it('sorts by updatedAt ascending', () => {
    const result = listTickets(
      TICKETS,
      parseSearch({
        sortBy: 'updated_at',
        sortOrder: 'asc',
        status: 'all',
        page: '1',
        pageSize: '10',
      }),
    );

    expect(result.items.map((ticket) => ticket.id)).toEqual([2, 1, 3]);
  });

  it('sorts by id descending', () => {
    const result = listTickets(
      TICKETS,
      parseSearch({
        sortBy: 'id',
        sortOrder: 'dsc',
        status: 'all',
        page: '1',
        pageSize: '10',
      }),
    );

    expect(result.items.map((ticket) => ticket.id)).toEqual([3, 2, 1]);
  });

  it('applies pagination after filtering and sorting', () => {
    const result = listTickets(
      TICKETS,
      parseSearch({
        sortBy: 'created_at',
        sortOrder: 'dsc',
        status: 'all',
        page: '2',
        pageSize: '1',
      }),
    );

    expect(result.total).toBe(3);
    expect(result.items.map((ticket) => ticket.id)).toEqual([1]);
  });

  it('creates a ticket with generated id and timestamps', () => {
    const tickets = structuredClone(TICKETS);
    const result = createTicketItem(
      tickets,
      {
        title: 'Write docs',
        status: 'open',
        assignee: 'sora',
      },
      '2026-03-06T10:00:00Z',
    );

    expect(result).toMatchObject({
      id: 4,
      title: 'Write docs',
      status: 'open',
      assignee: 'sora',
      createdBy: TICKET_ADMIN,
      updatedBy: TICKET_ADMIN,
      createdAt: '2026-03-06T10:00:00Z',
      updatedAt: '2026-03-06T10:00:00Z',
      history: createEmptyHistory(),
    });
    expect(tickets[0]?.id).toBe(4);
  });

  it('updates an existing ticket and refreshes updatedAt', () => {
    const tickets = structuredClone(TICKETS);
    tickets[1].history.items.push({
      operationId: 'mock-op-existing',
      actor: TICKET_EDITOR,
      changedAt: '2026-03-05T10:00:00Z',
      changes: [
        {
          field: 'status',
          before: 'open',
          after: 'closed',
        },
      ],
    });
    const result = updateTicketItem(
      tickets,
      {
        id: 2,
        title: 'Refactor search filters',
        status: 'open',
        assignee: 'nao',
      },
      '2026-03-06T11:00:00Z',
    );

    expect(result).toMatchObject({
      id: 2,
      title: 'Refactor search filters',
      status: 'open',
      assignee: 'nao',
      updatedBy: TICKET_ADMIN,
      updatedAt: '2026-03-06T11:00:00Z',
    });
    expect(result?.history.items).toHaveLength(2);
    expect(result?.history.items[0]).toMatchObject({
      operationId: 'mock-op-2-1772794800000',
      actor: TICKET_ADMIN,
      changedAt: '2026-03-06T11:00:00Z',
      changes: [
        {
          field: 'status',
          before: 'closed',
          after: 'open',
        },
      ],
    });
    expect(result?.history.items[1]?.operationId).toBe('mock-op-existing');
  });

  it('deletes an existing ticket by id', () => {
    const tickets = structuredClone(TICKETS);
    const removed = deleteTicketItem(tickets, 1);

    expect(removed?.id).toBe(1);
    expect(tickets.map((ticket) => ticket.id)).toEqual([2, 3]);
  });
});
