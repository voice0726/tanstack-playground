import {
  CreateTicketRequest,
  type CreateTicketRequest as CreateTicketRequestType,
  type Ticket,
  ticketsResponseSchema,
  ticketsSchema,
  UpdateTicketRequest,
  type UpdateTicketRequest as UpdateTicketRequestType,
} from '#/features/tickets/schema/index.ts';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';
import { env } from '#/shared/config/env.ts';
import { withQuery } from '#/shared/utils/url.ts';

const API_BASE_URL = env.VITE_API_BASE_URL;
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

const deleteTicketResponseSchema = ticketsSchema.pick({ id: true });

const createApiUrl = (path: string, search?: TicketsSearch) =>
  `${API_BASE_URL}${withQuery(path, search)}`;

const ensureSuccess = async (response: Response, message: string) => {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status}`);
  }

  return response.json();
};

export const fetchTickets = async (filters: TicketsSearch) => {
  const response = await fetch(createApiUrl('/api/tickets', filters), {
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  return ticketsResponseSchema.parse(await ensureSuccess(response, 'Failed to fetch tickets'));
};

export const fetchTicket = async (id: Ticket['id']) => {
  const response = await fetch(createApiUrl(`/api/tickets/${id}`), {
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  return ticketsSchema.parse(await ensureSuccess(response, 'Failed to fetch ticket'));
};

export const createTicket = async (body: CreateTicketRequestType) => {
  const payload = CreateTicketRequest.parse(body);
  const response = await fetch(createApiUrl('/api/tickets'), {
    method: 'POST',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  return ticketsSchema.parse(await ensureSuccess(response, 'Failed to create ticket'));
};

export const updateTicket = async (body: UpdateTicketRequestType) => {
  const payload = UpdateTicketRequest.parse(body);
  const response = await fetch(createApiUrl(`/api/tickets/${payload.id}`), {
    method: 'PUT',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  return ticketsSchema.parse(await ensureSuccess(response, 'Failed to update ticket'));
};

export const deleteTicket = async (id: Ticket['id']) => {
  const response = await fetch(createApiUrl(`/api/tickets/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  return deleteTicketResponseSchema.parse(await ensureSuccess(response, 'Failed to delete ticket'));
};
