import * as z from 'zod';
import { CreateTicketCommentRequest } from './index.ts';

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

export const TICKET_COMMENT_FORM_DEFAULT_VALUES = {
  body: '',
} as const;

export const ticketCommentFormValuesSchema = CreateTicketCommentRequest.extend({
  body: z.string().trim().min(1, 'コメントは必須です'),
});

export type TicketCommentFormInput = z.input<typeof ticketCommentFormValuesSchema>;
export type TicketCommentFormOutput = z.output<typeof ticketCommentFormValuesSchema>;
