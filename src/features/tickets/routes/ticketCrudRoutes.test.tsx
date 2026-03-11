import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '#/features/auth/schema.ts';
import {
  CreateTicketCommentRequest,
  type CreateTicketRequest,
  type TicketComments,
  type TicketHistory,
  type UpdateTicketRequest,
} from '#/features/tickets/schema/index.ts';
import { ticketsSearchSchema } from '#/features/tickets/schema/search.ts';
import {
  createTicketCommentItem,
  createTicketItem,
  deleteTicketCommentItem,
  deleteTicketItem,
  getTicketById,
  listTickets,
  updateTicketCommentItem,
  updateTicketItem,
} from '#/mocks/handlers.ts';
import { server } from '#/mocks/node.ts';
import { createRouter } from '#/router.tsx';
import { env } from '#/shared/config/env.ts';
import { TICKET_ADMIN, TICKET_CREATOR, TICKET_EDITOR } from '@/test/fixtures/ticketActors.ts';

const API_BASE_URL = env.VITE_API_BASE_URL;
type MockTicket = Parameters<typeof listTickets>[0][number];
const AUTH_USER: AuthUser = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin User',
};

const createEmptyHistory = (): TicketHistory => ({ items: [] });
const createEmptyComments = (): TicketComments => ({ items: [] });
const parseTicketId = (value: string | readonly string[] | undefined) => {
  if (Array.isArray(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
};
const parseCommentId = parseTicketId;

const buildSeedTickets = (): MockTicket[] => [
  {
    id: 1,
    title: 'Login bug',
    status: 'open',
    assignee: 'aki',
    createdBy: TICKET_CREATOR,
    updatedBy: TICKET_EDITOR,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z',
    history: {
      items: [
        {
          operationId: 'seed-op-1',
          actor: TICKET_EDITOR,
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
    comments: {
      items: [
        {
          id: 101,
          body: 'Initial investigation started.',
          createdBy: TICKET_EDITOR,
          createdAt: '2026-03-03T15:00:00Z',
        },
      ],
    },
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
    comments: createEmptyComments(),
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
    comments: createEmptyComments(),
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
    http.post(`${API_BASE_URL}/api/tickets/:id/comments`, async ({ params, request }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const id = parseTicketId(params.id);

      if (id === null) {
        return HttpResponse.json({ message: 'Invalid ticket id' }, { status: 400 });
      }

      let body: CreateTicketCommentRequest;

      try {
        body = CreateTicketCommentRequest.parse(await request.json());
      } catch {
        return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
      }

      const ticket = createTicketCommentItem(
        tickets,
        id,
        body,
        '2026-03-06T12:00:00Z',
        TICKET_ADMIN,
      );

      if (!ticket) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      return HttpResponse.json(ticket, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/api/tickets/:id/comments/:commentId`, async ({ params, request }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const ticketId = parseTicketId(params.id);
      const commentId = parseCommentId(params.commentId);

      if (ticketId === null || commentId === null) {
        return HttpResponse.json({ message: 'Invalid comment id' }, { status: 400 });
      }

      let body: CreateTicketCommentRequest;

      try {
        body = CreateTicketCommentRequest.parse(await request.json());
      } catch {
        return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
      }

      const ticket = getTicketById(tickets, ticketId);

      if (!ticket) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      const comment = ticket.comments.items.find((item) => item.id === commentId);

      if (!comment) {
        return HttpResponse.json({ message: 'comment not found' }, { status: 404 });
      }

      if (comment.createdBy?.id !== currentUser.id) {
        return HttpResponse.json(
          { message: 'comment can only be modified by its author' },
          { status: 403 },
        );
      }

      return HttpResponse.json(
        updateTicketCommentItem(tickets, ticketId, commentId, body, '2026-03-06T12:30:00Z'),
      );
    }),
    http.delete(`${API_BASE_URL}/api/tickets/:id/comments/:commentId`, ({ params }) => {
      if (!currentUser) {
        return HttpResponse.json({ message: 'authentication required' }, { status: 401 });
      }

      const ticketId = parseTicketId(params.id);
      const commentId = parseCommentId(params.commentId);

      if (ticketId === null || commentId === null) {
        return HttpResponse.json({ message: 'Invalid comment id' }, { status: 400 });
      }

      const ticket = getTicketById(tickets, ticketId);

      if (!ticket) {
        return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }

      const comment = ticket.comments.items.find((item) => item.id === commentId);

      if (!comment) {
        return HttpResponse.json({ message: 'comment not found' }, { status: 404 });
      }

      if (comment.createdBy?.id !== currentUser.id) {
        return HttpResponse.json(
          { message: 'comment can only be modified by its author' },
          { status: 403 },
        );
      }

      return HttpResponse.json(
        deleteTicketCommentItem(tickets, ticketId, commentId, '2026-03-06T13:00:00Z'),
      );
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
    expect(screen.getByText('コメント')).toBeTruthy();
    expect(screen.getByText('Initial investigation started.')).toBeTruthy();
    expect(screen.getByText('Creator User')).toBeTruthy();
    expect(screen.getByText('creator@example.com')).toBeTruthy();
    expect(screen.getAllByText('Editor User').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('ステータス')).toBeTruthy();
    expect(screen.getAllByText('Open')).toHaveLength(2);
    expect(screen.getByText('Closed')).toBeTruthy();
  });

  it('creates a comment on the detail page and shows it first', async () => {
    renderRoute('/tickets/1?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('Initial investigation started.');
    fireEvent.change(screen.getByLabelText('コメントを追加'), {
      target: { value: 'We are investigating this now.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));

    await screen.findByText('コメントを投稿しました');
    await screen.findByText('We are investigating this now.');
    const comments = screen.getAllByText(
      /^(We are investigating this now\.|Initial investigation started\.)$/,
    );
    expect(comments.map((comment) => comment.textContent)).toEqual([
      'We are investigating this now.',
      'Initial investigation started.',
    ]);
  });

  it('edits an authored comment on the detail page', async () => {
    renderRoute('/tickets/1?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('Initial investigation started.');
    fireEvent.change(screen.getByLabelText('コメントを追加'), {
      target: { value: 'We are investigating this now.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));

    await screen.findByText('We are investigating this now.');
    fireEvent.click(screen.getByRole('button', { name: 'コメント 102 を編集' }));
    fireEvent.change(screen.getByLabelText('コメントを編集'), {
      target: { value: 'Investigation has been completed.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '更新する' }));

    await screen.findByText('コメントを更新しました');
    await screen.findByText('Investigation has been completed.');
    expect(screen.queryByText('We are investigating this now.')).toBeNull();
  });

  it('deletes an authored comment on the detail page', async () => {
    renderRoute('/tickets/1?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('Initial investigation started.');
    fireEvent.change(screen.getByLabelText('コメントを追加'), {
      target: { value: 'We are investigating this now.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));

    await screen.findByText('We are investigating this now.');
    fireEvent.click(screen.getByRole('button', { name: 'コメント 102 を削除' }));
    const dialog = await screen.findByRole('dialog', { name: 'コメントを削除' });
    expect(
      within(dialog).getByText('この操作は取り消せません。削除対象を確認してください。'),
    ).toBeTruthy();
    expect(within(dialog).getByText('We are investigating this now.')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: '削除する' }));

    await screen.findByText('コメントを削除しました');
    await waitFor(() => {
      expect(screen.queryByText('We are investigating this now.')).toBeNull();
    });
    expect(screen.getByText('Initial investigation started.')).toBeTruthy();
  });

  it('allows retrying a failed comment deletion for the same comment', async () => {
    const tickets = buildSeedTickets();
    let deleteAttempts = 0;

    server.use(...createUiHandlers(tickets));
    server.use(
      http.delete(`${API_BASE_URL}/api/tickets/:id/comments/:commentId`, ({ params }) => {
        const ticketId = parseTicketId(params.id);
        const commentId = parseCommentId(params.commentId);

        if (ticketId === null || commentId === null) {
          return HttpResponse.json({ message: 'Invalid comment id' }, { status: 400 });
        }

        const ticket = getTicketById(tickets, ticketId);

        if (!ticket) {
          return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }

        const comment = ticket.comments.items.find((item) => item.id === commentId);

        if (!comment) {
          return HttpResponse.json({ message: 'comment not found' }, { status: 404 });
        }

        if (comment.createdBy?.id !== AUTH_USER.id) {
          return HttpResponse.json(
            { message: 'comment can only be modified by its author' },
            { status: 403 },
          );
        }

        deleteAttempts += 1;

        if (deleteAttempts === 1) {
          return HttpResponse.json({ message: 'temporary delete failure' }, { status: 500 });
        }

        return HttpResponse.json(
          deleteTicketCommentItem(tickets, ticketId, commentId, '2026-03-06T13:00:00Z'),
        );
      }),
    );

    renderRoute('/tickets/1?status=open&sortBy=id&sortOrder=asc&page=1&pageSize=10');

    await screen.findByText('Initial investigation started.');
    fireEvent.change(screen.getByLabelText('コメントを追加'), {
      target: { value: 'We are investigating this now.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));

    await screen.findByText('We are investigating this now.');
    fireEvent.click(screen.getByRole('button', { name: 'コメント 102 を削除' }));
    const firstDialog = await screen.findByRole('dialog', { name: 'コメントを削除' });
    fireEvent.click(within(firstDialog).getByRole('button', { name: '削除する' }));

    await screen.findByText('コメントの削除に失敗しました');
    fireEvent.click(within(firstDialog).getByRole('button', { name: 'キャンセル' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'コメントを削除' })).toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'コメント 102 を削除' }));
    const secondDialog = await screen.findByRole('dialog', { name: 'コメントを削除' });
    const confirmButton = within(secondDialog).getByRole('button', { name: '削除する' });

    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(confirmButton);

    await screen.findByText('コメントを削除しました');
    await waitFor(() => {
      expect(screen.queryByText('We are investigating this now.')).toBeNull();
    });
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
