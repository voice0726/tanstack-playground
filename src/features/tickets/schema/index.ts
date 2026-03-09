import * as z from 'zod';

export const ticketsSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['open', 'closed']),
  assignee: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Ticket = z.infer<typeof ticketsSchema>;

export const ticketHistoryChangeSchema = z.object({
  field: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
});

export type TicketHistoryChange = z.infer<typeof ticketHistoryChangeSchema>;

export const ticketHistoryItemSchema = z.object({
  operationId: z.string(),
  changedAt: z.iso.datetime(),
  changes: z.array(ticketHistoryChangeSchema),
});

export type TicketHistoryItem = z.infer<typeof ticketHistoryItemSchema>;

export const ticketHistorySchema = z.object({
  items: z.array(ticketHistoryItemSchema),
});

export type TicketHistory = z.infer<typeof ticketHistorySchema>;

export const ticketDetailSchema = ticketsSchema.extend({
  history: ticketHistorySchema,
});

export type TicketDetail = z.infer<typeof ticketDetailSchema>;

export const ticketsResponseSchema = z.object({
  items: z.array(ticketsSchema),
  total: z.number().int().nonnegative(),
});

export type TicketsResponse = z.infer<typeof ticketsResponseSchema>;

export const CreateTicketRequest = ticketsSchema.pick({
  title: true,
  status: true,
  assignee: true,
});
export type CreateTicketRequest = z.infer<typeof CreateTicketRequest>;

export const UpdateTicketRequest = ticketsSchema.pick({
  id: true,
  title: true,
  status: true,
  assignee: true,
});
export type UpdateTicketRequest = z.infer<typeof UpdateTicketRequest>;
