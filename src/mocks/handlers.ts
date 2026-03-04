import { HttpResponse, http } from 'msw';

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

export const handlers = [
  // Step1: 固定で返す（search params 無視）
  http.get('/api/tickets', () => {
    return HttpResponse.json({ items: TICKETS, total: TICKETS.length });
  }),
];
