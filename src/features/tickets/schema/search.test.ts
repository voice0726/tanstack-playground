import { describe, expect, it } from 'vitest';
import {
  normalizeTicketsSearchURL,
  TICKETS_SEARCH_DEFAULT,
  ticketsSearchURLSchema,
} from './search';

describe('ticketsSearchURLSchema', () => {
  it('allows optional URL params as strings', () => {
    const result = ticketsSearchURLSchema.parse({
      q: 'tanstack',
      status: 'open',
      sort: 'updated_at_asc',
      page: '2',
      pageSize: '20',
    });

    expect(result).toEqual({
      q: 'tanstack',
      status: 'open',
      sort: 'updated_at_asc',
      page: '2',
      pageSize: '20',
    });
  });
});

describe('normalizeTicketsSearchURL', () => {
  it('normalizes valid URL params', () => {
    const result = normalizeTicketsSearchURL({
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

  it('fills defaults when params are omitted', () => {
    const result = normalizeTicketsSearchURL({});

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });

  it('falls back to defaults for invalid enum params', () => {
    const result = normalizeTicketsSearchURL({
      status: 'in_progress',
      sort: 'priority_asc',
    });

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });

  it('falls back to defaults for invalid numeric params', () => {
    const result = normalizeTicketsSearchURL({
      page: 'abc',
      pageSize: 'def',
    });

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });

  it('falls back to defaults when numeric params are below min', () => {
    const result = normalizeTicketsSearchURL({
      page: '0',
      pageSize: '-5',
    });

    expect(result).toEqual(TICKETS_SEARCH_DEFAULT);
  });
});
