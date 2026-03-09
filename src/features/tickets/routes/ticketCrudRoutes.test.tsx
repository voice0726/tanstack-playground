import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '#/features/auth/schema.ts';
import type {
  CreateTicketRequest,
  TicketHistory,
  UpdateTicketRequest,
} from '#/features/tickets/schema/index.ts';
import { ticketsSearchSchema } from '#/features/tickets/schema/search.ts';
import {
  createTicketItem,
  deleteTicketItem,
  getTicketById,
  listTickets,
  updateTicketItem,
} from '#/mocks/handlers.ts';
import { server } from '#/mocks/node.ts';
import { createRouter } from '#/router.tsx';
import { env } from '#/shared/config/env.ts';

const API_BASE_URL = env.VITE_API_BASE_URL;
type MockTicket = Parameters<typeof listTickets>[0][number];
const AUTH_USER: AuthUser = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin User',
};

const createEmptyHistory = (): TicketHistory => ({ items: [] });

const buildSeedTickets = (): MockTicket[] => [
  {
    id: 1,
    title: 'Login bug',
    status: 'open',
    assignee: 'aki',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z',
    history: {
      items: [
        {
          operationId: 'seed-op-1',
          changedAt: '2026-03-03T15:00:00Z',
          changes: [
            {
              field: 'status',
              before: 'closed',
              after: 'open',
            },
          ],
        },
      ],
    },
  },
  {
    id: 2,
    title: 'Refactor filters',
    status: 'closed',
    assignee: null,
    createdAt: '2026-02-27T12:00:00Z',
    updatedAt: '2026-03-01T09:45:00Z',
    history: createEmptyHistory(),
  },
  {
    id: 3,
    title: 'Add pagination',
    status: 'open',
    assignee: 'mika',
    createdAt: '2026-03-02T09:30:00Z',
    updatedAt: '2026-03-04T08:20:00Z',
    history: createEmptyHistory(),
  },
];

const createUiHandlers = (tickets: MockTicket[], initialUser: AuthUser | null = AUTH_USER) => {
  let currentUser = initialUser;

  return [
    http.get(`${API_BASE_URL}/api/auth/me`, () => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      return HttpResponse.json({ user: currentUser });
    }),
    http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };

      if (body.email !== AUTH_USER.email || body.password !== 'secret-password') {
        return HttpResponse.json({ message: 'invalid email or password' }, { status: 401 });
      }

      currentUser = AUTH_USER;

      return HttpResponse.json({ user: AUTH_USER });
    }),
    http.post(`${API_BASE_URL}/api/auth/logout`, () => {
      currentUser = null;

      return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${API_BASE_URL}/api/tickets`, ({ request }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const url = new URL(request.url);
      const search = ticketsSearchSchema.parse(Object.fromEntries(url.searchParams.entries()));

      return HttpResponse.json(listTickets(tickets, search));
    }),
    http.get(`${API_BASE_URL}/api/tickets/:id`, ({ params }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const ticket = getTicketById(tickets, Number(params.id));

      if (!ticket) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      return HttpResponse.json(ticket);
    }),
    http.post(`${API_BASE_URL}/api/tickets`, async ({ request }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const body = (await request.json()) as CreateTicketRequest;
      const ticket = createTicketItem(tickets, body, '2026-03-06T10:00:00Z');

      return HttpResponse.json(ticket, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/api/tickets/:id`, async ({ params, request }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const body = (await request.json()) as UpdateTicketRequest;
      const ticket = updateTicketItem(tickets, body, '2026-03-06T11:00:00Z');

      if (!ticket || ticket.id !== Number(params.id)) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      return HttpResponse.json(ticket);
    }),
    http.delete(`${API_BASE_URL}/api/tickets/:id`, ({ params }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const ticket = deleteTicketItem(tickets, Number(params.id));

      if (!ticket) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      return new HttpResponse(null, { status: 204 });
    }),
  ];
};

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

const renderRoute = (initialEntry: string) => {
  const queryClient = createTestQueryClient();
  const history = createMemoryHistory({
    initialEntries: [initialEntry],
  });
  const router = createRouter(queryClient, history);

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router };
};

describe('ticket CRUD routes', () => {
  beforeEach(() => {
    server.use(...createUiHandlers(buildSeedTickets()));
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects unauthenticated users from protected routes to home', async () => {
    server.use(...createUiHandlers(buildSeedTickets(), null));

    const { router } = renderRoute(
      '/tickets?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10',
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    await screen.findByRole('button', { name: 'ログイン' });
  });

  it('logs in from home and reaches protected routes', async () => {
    server.use(...createUiHandlers(buildSeedTickets(), null));

    renderRoute('/');

    await screen.findByLabelText('メールアドレス');
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'secret-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await screen.findByText('ログイン済みです');
    fireEvent.click(screen.getByRole('button', { name: 'チケット画面へ進む' }));

    await screen.findByText('チケット一覧');
  });

  it('keeps search params when moving between list and detail pages', async () => {
    const { router } = renderRoute(
      '/tickets?q=Login&status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10',
    );

    await screen.findByText('Login bug');
    fireEvent.click(await screen.findByRole('button', { name: '詳細' }));

    await screen.findByText('チケット #1');
    fireEvent.click(screen.getAllByRole('button', { name: '一覧に戻る' })[0]);

    await screen.findByDisplayValue('Login');
    expect(router.state.location.search).toMatchObject({
      q: 'Login',
      status: 'open',
    });
  });

  it('shows operation history on the detail page', async () => {
    renderRoute('/tickets/1?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('操作履歴');
    expect(screen.getByText('ステータス')).toBeTruthy();
    expect(screen.getAllByText('Open')).toHaveLength(2);
    expect(screen.getByText('Closed')).toBeTruthy();
  });

  it('creates a ticket, shows a toast, and preserves list search params on return', async () => {
    const { router } = renderRoute(
      '/tickets/new?q=Login&status=open&sortBy=id&sortOrder=asc&page=2&pageSize=20',
    );

    await screen.findByRole('button', { name: '作成する' });
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'Write docs' },
    });
    fireEvent.change(screen.getByLabelText('担当者'), {
      target: { value: 'sora' },
    });
    fireEvent.click(screen.getByRole('button', { name: '作成する' }));

    await screen.findByText('チケットを作成しました');
    await screen.findByText('Write docs');
    fireEvent.click(screen.getByRole('button', { name: '一覧に戻る' }));

    await screen.findByDisplayValue('Login');
    expect(router.state.location.search).toMatchObject({
      q: 'Login',
      status: 'open',
      page: 2,
      pageSize: 20,
    });
  });

  it('updates a ticket from the edit page and returns to detail with a toast', async () => {
    const { router } = renderRoute(
      '/tickets/1/edit?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=20',
    );

    await screen.findByDisplayValue('Login bug');
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'Login bug resolved' },
    });
    fireEvent.click(screen.getByRole('button', { name: '更新する' }));

    await screen.findByText('チケットを更新しました');
    await screen.findByText('Login bug resolved');
    expect(router.state.location.search).toMatchObject({
      status: 'open',
      pageSize: 20,
    });
  });

  it('keeps unsaved search input when opening the delete modal', async () => {
    renderRoute('/tickets?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('Login bug');
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'draft filter' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: '削除' })[0]);

    await screen.findByText('この操作は取り消せません。削除対象を確認してください。');
    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('draft filter');
  });

  it('deletes a ticket from the list, shows a toast, and keeps the current search params', async () => {
    const { router } = renderRoute(
      '/tickets?q=Login&status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10',
    );

    await screen.findByText('Login bug');
    fireEvent.click(screen.getByRole('button', { name: '削除' }));
    await screen.findByText('この操作は取り消せません。削除対象を確認してください。');
    fireEvent.click(screen.getByRole('button', { name: '削除する' }));

    await screen.findByText('チケットを削除しました');
    await waitFor(() => {
      expect(screen.queryByText('Login bug')).toBeNull();
    });
    expect(router.state.location.search).toMatchObject({
      q: 'Login',
      status: 'open',
    });
  });
});
