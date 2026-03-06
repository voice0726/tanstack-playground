import * as z from 'zod';

export const TICKET_FORM_DEFAULT_VALUES = {
  title: '',
  status: 'open',
  assignee: '',
} as const;

export const ticketFormValuesSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは必須です'),
  status: z.enum(['open', 'closed']),
  assignee: z
    .string()
    .trim()
    .transform((value) => value || null),
});

export type TicketFormInput = z.input<typeof ticketFormValuesSchema>;
export type TicketFormOutput = z.output<typeof ticketFormValuesSchema>;
