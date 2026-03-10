import { describe, expect, it } from 'vitest';
import { ticketDetailSchema, ticketsResponseSchema } from './index.ts';

describe('ticket actor schema compatibility', () => {
  it('accepts null and omitted createdBy/updatedBy in ticket summaries', () => {
    expect(() =>
      ticketsResponseSchema.parse({
        items: [
          {
            id: 1,
            title: 'Login bug',
            status: 'open',
            assignee: null,
            createdBy: null,
            updatedBy: null,
            createdAt: '2026-03-01T10:00:00Z',
            updatedAt: '2026-03-03T15:00:00Z',
          },
          {
            id: 2,
            title: 'Refactor filters',
            status: 'closed',
            assignee: 'mika',
            createdAt: '2026-03-02T10:00:00Z',
            updatedAt: '2026-03-04T15:00:00Z',
          },
        ],
        total: 2,
      }),
    ).not.toThrow();
  });

  it('accepts null and omitted actor in ticket history items', () => {
    expect(() =>
      ticketDetailSchema.parse({
        id: 1,
        title: 'Login bug',
        status: 'open',
        assignee: 'aki',
        createdBy: null,
        updatedBy: null,
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-03T15:00:00Z',
        history: {
          items: [
            {
              operationId: 'op-1',
              actor: null,
              changedAt: '2026-03-03T15:00:00Z',
              changes: [
                {
                  field: 'status',
                  before: 'closed',
                  after: 'open',
                },
              ],
            },
            {
              operationId: 'op-2',
              changedAt: '2026-03-04T15:00:00Z',
              changes: [
                {
                  field: 'assignee',
                  before: null,
                  after: 'mika',
                },
              ],
            },
          ],
        },
      }),
    ).not.toThrow();
  });
});
