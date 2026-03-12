import {
  CreateTicketCommentRequest,
  type CreateTicketCommentRequest as CreateTicketCommentRequestType,
  CreateTicketRequest,
  type CreateTicketRequest as CreateTicketRequestType,
  type Ticket,
  ticketDetailSchema,
  ticketsResponseSchema,
  ticketsSchema,
  UpdateTicketRequest,
  type UpdateTicketRequest as UpdateTicketRequestType,
} from '@/features/tickets/schema/index.ts';
import type { TicketsSearch } from '@/features/tickets/schema/search.ts';
import { createApiUrl, ensureSuccess, JSON_HEADERS } from '@/shared/api/http.ts';
import { withQuery } from '@/shared/utils/url.ts';

const deleteTicketResponseSchema = ticketsSchema.pick({ id: true });

const createTicketsApiUrl = (path: string, search?: TicketsSearch) =>
  createApiUrl(withQuery(path, search));

export const fetchTickets = async (filters: TicketsSearch) => {
  const response = await fetch(createTicketsApiUrl('/api/tickets', filters), {
    credentials: 'include',
    headers: JSON_HEADERS,
  });

  await ensureSuccess(response, 'チケット一覧の取得に失敗しました。');

  return ticketsResponseSchema.parse(await response.json());
};

export const fetchTicket = async (id: Ticket['id']) => {
  const response = await fetch(createTicketsApiUrl(`/api/tickets/${id}`), {
    credentials: 'include',
    headers: JSON_HEADERS,
  });

  await ensureSuccess(response, 'チケット情報の取得に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};

export const createTicket = async (body: CreateTicketRequestType) => {
  const payload = CreateTicketRequest.parse(body);
  const response = await fetch(createTicketsApiUrl('/api/tickets'), {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  await ensureSuccess(response, 'チケットの作成に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};

export const updateTicket = async (body: UpdateTicketRequestType) => {
  const payload = UpdateTicketRequest.parse(body);
  const response = await fetch(createTicketsApiUrl(`/api/tickets/${payload.id}`), {
    method: 'PUT',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  await ensureSuccess(response, 'チケットの更新に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};

export const deleteTicket = async (id: Ticket['id']) => {
  const response = await fetch(createTicketsApiUrl(`/api/tickets/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: JSON_HEADERS,
  });

  await ensureSuccess(response, 'チケットの削除に失敗しました。');

  return deleteTicketResponseSchema.parse({ id });
};

export const createTicketComment = async ({
  ticketId,
  body,
}: {
  ticketId: Ticket['id'];
  body: CreateTicketCommentRequestType['body'];
}) => {
  const payload = CreateTicketCommentRequest.parse({ body });
  const response = await fetch(createTicketsApiUrl(`/api/tickets/${ticketId}/comments`), {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  await ensureSuccess(response, 'コメントの投稿に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};

export const updateTicketComment = async ({
  ticketId,
  commentId,
  body,
}: {
  ticketId: Ticket['id'];
  commentId: number;
  body: CreateTicketCommentRequestType['body'];
}) => {
  const payload = CreateTicketCommentRequest.parse({ body });
  const response = await fetch(
    createTicketsApiUrl(`/api/tickets/${ticketId}/comments/${commentId}`),
    {
      method: 'PUT',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
  );

  await ensureSuccess(response, 'コメントの更新に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};

export const deleteTicketComment = async ({
  ticketId,
  commentId,
}: {
  ticketId: Ticket['id'];
  commentId: number;
}) => {
  const response = await fetch(
    createTicketsApiUrl(`/api/tickets/${ticketId}/comments/${commentId}`),
    {
      method: 'DELETE',
      credentials: 'include',
      headers: JSON_HEADERS,
    },
  );

  await ensureSuccess(response, 'コメントの削除に失敗しました。');

  return ticketDetailSchema.parse(await response.json());
};
