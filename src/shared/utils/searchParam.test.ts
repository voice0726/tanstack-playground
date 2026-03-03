import { describe, expect, it } from 'vitest';
import { normalizeSearchParam, normalizeSearchParams } from './searchParam';

describe('normalizeSearchParam', () => {
  it('returns the value as-is when the input is a string', () => {
    const result = normalizeSearchParam('open');

    expect(result).toBe('open');
  });

  it('returns the first element when the input is a string array', () => {
    const result = normalizeSearchParam(['open', 'closed']);

    expect(result).toBe('open');
  });
});

describe('normalizeSearchParams', () => {
  it('normalizes all fields to strings and respects the first element of arrays', () => {
    const result = normalizeSearchParams({
      status: ['open', 'closed'],
      sort: 'created_at_asc',
      page: ['2', '3'],
    });

    expect(result).toEqual({
      status: 'open',
      sort: 'created_at_asc',
      page: '2',
    });
  });
});
