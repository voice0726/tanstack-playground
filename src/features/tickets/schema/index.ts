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

export const ticketsResponseSchema = z.object({
  items: z.array(ticketsSchema),
  total: z.number().int().nonnegative(),
});

export type TicketsResponse = z.infer<typeof ticketsResponseSchema>;
