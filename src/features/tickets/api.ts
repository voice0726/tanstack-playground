import {
  CreateTicketRequest,
  type CreateTicketRequest as CreateTicketRequestType,
  type Ticket,
  ticketDetailSchema,
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

const ensureSuccess = (response: Response, message: string) => {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status}`);
  }
};

export const fetchTickets = async (filters: TicketsSearch) => {
  const response = await fetch(createApiUrl('/api/tickets', filters), {
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  ensureSuccess(response, 'Failed to fetch tickets');

  return ticketsResponseSchema.parse(await response.json());
};

export const fetchTicket = async (id: Ticket['id']) => {
  const response = await fetch(createApiUrl(`/api/tickets/${id}`), {
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  ensureSuccess(response, 'Failed to fetch ticket');

  return ticketDetailSchema.parse(await response.json());
};

export const createTicket = async (body: CreateTicketRequestType) => {
  const payload = CreateTicketRequest.parse(body);
  const response = await fetch(createApiUrl('/api/tickets'), {
    method: 'POST',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  ensureSuccess(response, 'Failed to create ticket');

  return ticketDetailSchema.parse(await response.json());
};

export const updateTicket = async (body: UpdateTicketRequestType) => {
  const payload = UpdateTicketRequest.parse(body);
  const response = await fetch(createApiUrl(`/api/tickets/${payload.id}`), {
    method: 'PUT',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  ensureSuccess(response, 'Failed to update ticket');

  return ticketDetailSchema.parse(await response.json());
};

export const deleteTicket = async (id: Ticket['id']) => {
  const response = await fetch(createApiUrl(`/api/tickets/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: DEFAULT_HEADERS,
  });

  ensureSuccess(response, 'Failed to delete ticket');

  return deleteTicketResponseSchema.parse({ id });
};
