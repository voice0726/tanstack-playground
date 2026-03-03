import * as z from 'zod';

export const ticketsSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['open', 'closed']),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Ticket = z.infer<typeof ticketsSchema>;
