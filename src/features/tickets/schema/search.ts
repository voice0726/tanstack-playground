import * as z from 'zod';

export const TICKETS_SEARCH_DEFAULT = {
  q: undefined,
  status: 'all',
  sort: 'created_at_dsc',
  page: 1,
  pageSize: 10,
} as const;

export const ticketsSearchSchema = z.object({
  q: z.string().trim().optional().catch(undefined),
  status: z.enum(['all', 'open', 'closed']).catch(TICKETS_SEARCH_DEFAULT.status),
  // TODO: sortのパターンの生成をts-patternでできないか検討
  sort: z
    .enum(['created_at_asc', 'created_at_dsc', 'updated_at_asc', 'updated_at_dsc'])
    .catch(TICKETS_SEARCH_DEFAULT.sort),
  page: z.coerce.number().catch(TICKETS_SEARCH_DEFAULT.page),
  pageSize: z.coerce.number().catch(TICKETS_SEARCH_DEFAULT.pageSize),
});

export type TicketsSearch = z.infer<typeof ticketsSearchSchema>;
