import { describe, expect, it } from 'vitest';
import { type TicketsSearch, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';
import { listTickets } from './handlers';

type MockTicket = {
  id: number;
  title: string;
  status: 'open' | 'closed';
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
};

const TICKETS: MockTicket[] = [
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
});
