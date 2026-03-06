import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useTickets } from '#/features/tickets/hooks/useTickets.ts';
import type {
  CreateTicketRequest,
  Ticket,
  UpdateTicketRequest,
} from '#/features/tickets/schema/index.ts';
import { TICKETS_SEARCH_DEFAULT } from '#/features/tickets/schema/search.ts';
import { server } from '#/mocks/node.ts';
import { env } from '#/shared/config/env.ts';
import { useCreateTicket } from './useCreateTicket';
import { useDeleteTicket } from './useDeleteTicket';
import { useTicket } from './useTicket';
import { useUpdateTicket } from './useUpdateTicket';

const API_BASE_URL = env.VITE_API_BASE_URL;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui: ReactNode) => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper });
};

const buildSeedTickets = (): Ticket[] => [
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

const createIntegrationHandlers = (tickets: Ticket[]) => [
  http.get(`${API_BASE_URL}/api/tickets`, () => {
    const items = [...tickets].sort((a, b) => a.id - b.id);

    return HttpResponse.json({
      items,
      total: items.length,
    });
  }),
  http.get(`${API_BASE_URL}/api/tickets/:id`, ({ params }) => {
    const id = Number(params.id);
    const ticket = tickets.find((item) => item.id === id);

    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json(ticket);
  }),
  http.post(`${API_BASE_URL}/api/tickets`, async ({ request }) => {
    const body = (await request.json()) as CreateTicketRequest;
    const ticket: Ticket = {
      id: tickets.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      title: body.title,
      status: body.status,
      assignee: body.assignee ?? null,
      createdAt: '2026-03-06T10:00:00Z',
      updatedAt: '2026-03-06T10:00:00Z',
    };

    tickets.push(ticket);

    return HttpResponse.json(ticket, { status: 201 });
  }),
  http.put(`${API_BASE_URL}/api/tickets/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateTicketRequest;
    const ticket = tickets.find((item) => item.id === id);

    if (!ticket || body.id !== id) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    ticket.title = body.title;
    ticket.status = body.status;
    ticket.assignee = body.assignee ?? null;
    ticket.updatedAt = '2026-03-06T11:00:00Z';

    return HttpResponse.json(ticket);
  }),
  http.delete(`${API_BASE_URL}/api/tickets/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = tickets.findIndex((item) => item.id === id);

    if (index < 0) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    tickets.splice(index, 1);

    return HttpResponse.json({ id });
  }),
];

const listFilters = { ...TICKETS_SEARCH_DEFAULT, pageSize: 100 };

function TicketListProbe() {
  const { data, error, isPending, isError } = useTickets({ filters: listFilters });

  if (isPending) {
    return <p>loading-list</p>;
  }

  if (isError || !data) {
    return <p>list-error:{error instanceof Error ? error.message : 'unknown'}</p>;
  }

  return (
    <ul aria-label="ticket-list">
      {data.items.map((ticket) => (
        <li key={ticket.id}>
          {ticket.id}:{ticket.title}:{ticket.status}:{ticket.assignee ?? '-'}
        </li>
      ))}
    </ul>
  );
}

function TicketDetailProbe({ id }: { id: number }) {
  const { data, error, isPending, isError } = useTicket({ id });

  if (isPending) {
    return <p>loading-detail</p>;
  }

  if (isError || !data) {
    return <p>detail-error:{error instanceof Error ? error.message : 'unknown'}</p>;
  }

  return (
    <p>
      {data.id}:{data.title}:{data.status}:{data.assignee ?? '-'}
    </p>
  );
}

function CreateTicketIntegrationProbe() {
  const mutation = useCreateTicket();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          mutation.mutate({
            title: 'Write docs',
            status: 'open',
            assignee: 'sora',
          });
        }}
      >
        create-ticket
      </button>
      <TicketListProbe />
    </>
  );
}

function UpdateTicketIntegrationProbe() {
  const mutation = useUpdateTicket();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          mutation.mutate({
            id: 1,
            title: 'Login bug resolved',
            status: 'closed',
            assignee: 'nao',
          });
        }}
      >
        update-ticket
      </button>
      <TicketDetailProbe id={1} />
    </>
  );
}

function DeleteTicketIntegrationProbe() {
  const mutation = useDeleteTicket();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          mutation.mutate(1);
        }}
      >
        delete-ticket
      </button>
      <TicketListProbe />
    </>
  );
}

describe('ticket CRUD hooks', () => {
  beforeEach(() => {
    server.use(...createIntegrationHandlers(buildSeedTickets()));
  });

  afterEach(() => {
    cleanup();
  });

  it('useTicket fetches detail through api.ts and MSW', async () => {
    renderWithQueryClient(<TicketDetailProbe id={1} />);

    await screen.findByText('1:Login bug:open:aki');
  });

  it('useCreateTicket updates the rendered ticket list after the server accepts creation', async () => {
    renderWithQueryClient(<CreateTicketIntegrationProbe />);

    await screen.findByText('1:Login bug:open:aki');
    fireEvent.click(screen.getByRole('button', { name: 'create-ticket' }));

    await screen.findByText('4:Write docs:open:sora');
  });

  it('useUpdateTicket keeps the rendered detail in sync after a successful update', async () => {
    renderWithQueryClient(<UpdateTicketIntegrationProbe />);

    await screen.findByText('1:Login bug:open:aki');
    fireEvent.click(screen.getByRole('button', { name: 'update-ticket' }));

    await screen.findByText('1:Login bug resolved:closed:nao');
  });

  it('useDeleteTicket removes the deleted row from the rendered ticket list', async () => {
    renderWithQueryClient(<DeleteTicketIntegrationProbe />);

    await screen.findByText('1:Login bug:open:aki');
    fireEvent.click(screen.getByRole('button', { name: 'delete-ticket' }));

    await waitFor(() => {
      expect(screen.queryByText('1:Login bug:open:aki')).toBeNull();
    });
  });
});
