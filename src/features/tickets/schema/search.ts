import * as z from 'zod';

export const TICKETS_SEARCH_DEFAULT = {
  q: '',
  status: 'all',
  sort: 'created_at_dsc',
  page: 1,
  pageSize: 10,
} as const;

export const ticketsSearchSchema = z.object({
  q: z.string().catch(TICKETS_SEARCH_DEFAULT.q),
  status: z.enum(['all', 'open', 'closed']).catch(TICKETS_SEARCH_DEFAULT.status),
  // TODO: sortのパターンの生成をts-patternでできないか検討
  sort: z
    .enum(['created_at_asc', 'created_at_dsc', 'updated_at_asc', 'updated_at_dsc'])
    .catch(TICKETS_SEARCH_DEFAULT.sort),
  page: z.coerce.number().int().min(1).catch(TICKETS_SEARCH_DEFAULT.page),
  pageSize: z.coerce.number().int().min(1).catch(TICKETS_SEARCH_DEFAULT.pageSize),
});

export const ticketsSearchURLSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type TicketsSearch = z.infer<typeof ticketsSearchSchema>;
export type TicketsSearchURL = z.infer<typeof ticketsSearchURLSchema>;

export const normalizeTicketsSearchURL = (url: TicketsSearchURL) => ticketsSearchSchema.parse(url);
