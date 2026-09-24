import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActiveTicketFilters } from './ActiveTicketFilters.tsx';
import { ticketsSearchSchema } from '@/features/tickets/schema/search.ts';

afterEach(cleanup);

describe('ActiveTicketFilters', () => {
  it('shows each active condition and removes only the selected one', () => {
    const onRemove = vi.fn<(filter: 'q' | 'status' | 'sort') => void>();
    const filters = ticketsSearchSchema.parse({
      q: 'Login',
      status: 'open',
      sortBy: 'updated_at',
      sortOrder: 'dsc',
    });

    render(
      <MantineProvider>
        <ActiveTicketFilters filters={filters} onRemove={onRemove} />
      </MantineProvider>,
    );

    expect(screen.getByRole('button', { name: 'タイトル条件を解除' }).textContent).toContain('Login');
    expect(screen.getByRole('button', { name: 'ステータス条件を解除' }).textContent).toContain(
      'Open',
    );
    expect(screen.getByRole('button', { name: '並び順条件を解除' }).textContent).toContain(
      '更新日',
    );

    fireEvent.click(screen.getByRole('button', { name: 'タイトル条件を解除' }));

    expect(screen.queryByRole('button', { name: 'タイトル条件を解除' })).toBeNull();
    expect(screen.getByRole('button', { name: 'ステータス条件を解除' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '並び順条件を解除' })).toBeTruthy();
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('q');
  });

  it('does not show a summary for default search conditions', () => {
    const filters = ticketsSearchSchema.parse({});
    render(
      <MantineProvider>
        <ActiveTicketFilters filters={filters} onRemove={vi.fn<() => void>()} />
      </MantineProvider>,
    );

    expect(screen.queryByText('適用中の条件:')).toBeNull();
  });
});
