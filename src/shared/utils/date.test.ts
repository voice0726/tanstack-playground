import { describe, expect, it } from 'vitest';
import { formatDateTime } from './date';

describe('formatDateTime', () => {
  it('formats ISO datetime', () => {
    expect(formatDateTime('2026-03-04T08:20:00')).toBe('2026/03/04 08:20');
  });

  it('returns original value when datetime is invalid', () => {
    expect(formatDateTime('invalid-datetime')).toBe('invalid-datetime');
  });
});
