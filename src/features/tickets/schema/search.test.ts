import { describe, expect, it } from 'vitest';
import { TICKETS_SEARCH_DEFAULT, ticketsSearchSchema } from './search';

describe('validateAndNormalizeSearch', () => {
  it('passes and normalize valid URL params', () => {
    const result = ticketsSearchSchema.parse({
      q: 'bug',
      status: 'closed',
      sort: 'created_at_dsc',
      page: '3',
      pageSize: '50',
    });

    expect(result).toEqual({
      q: 'bug',
      status: 'closed',
      sort: 'created_at_dsc',
      page: 3,
      pageSize: 50,
    });
  });

  it('trims whitespace from q param', () => {
    const result = ticketsSearchSchema.parse({
      q: '  bug  ',
    });
    expect(result.q).toBe('bug');
  });

  it('fills defaults when params are omitted', () => {
    const result = ticketsSearchSchema.parse({});

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });

  it('falls back to defaults for invalid enum params', () => {
    const result = ticketsSearchSchema.parse({
      status: 'in_progress',
      sort: 'priority_asc',
    });

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });

  it('falls back to defaults for invalid numeric params', () => {
    const result = ticketsSearchSchema.parse({
      page: 'abc',
      pageSize: 'def',
    });

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });
});
