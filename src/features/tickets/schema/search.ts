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
    .enum([
      'id_asc',
      'id_dsc',
      'created_at_asc',
      'created_at_dsc',
      'updated_at_asc',
      'updated_at_dsc',
    ])
    .catch(TICKETS_SEARCH_DEFAULT.sort),
  page: z.coerce.number().int().min(1).catch(TICKETS_SEARCH_DEFAULT.page),
  pageSize: z.coerce.number().int().min(1).catch(TICKETS_SEARCH_DEFAULT.pageSize),
});

export type TicketsSearch = z.infer<typeof ticketsSearchSchema>;

export const TICKETS_SEARCH_FORM_VALUES_DEFAULT = {
  q: '',
  status: 'all',
  sort: 'created_at_dsc',
} as const;

export const ticketsSearchFormValuesSchema = z.object({
  q: z.string().trim(),
  status: z.enum(['all', 'open', 'closed']),
  sort: z.enum([
    'id_asc',
    'id_dsc',
    'created_at_asc',
    'created_at_dsc',
    'updated_at_asc',
    'updated_at_dsc',
  ]),
});

export type TicketsSearchFormInput = z.input<typeof ticketsSearchFormValuesSchema>;
export type TicketsSearchFormOutput = z.output<typeof ticketsSearchFormValuesSchema>;
