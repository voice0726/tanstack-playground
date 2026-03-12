import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '#/shared/ui/toast.tsx';
import { TicketCommentsPanel } from './TicketCommentsPanel.tsx';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderCommentsSection = (ui: ReactNode) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MantineProvider>
        <ToastProvider>{ui}</ToastProvider>
      </MantineProvider>
    </QueryClientProvider>,
  );

afterEach(() => {
  cleanup();
});

describe('TicketCommentsPanel', () => {
  it('does not render ownership actions without a resolved current user and author', () => {
    renderCommentsSection(
      <TicketCommentsPanel
        comments={{
          items: [
            {
              id: 101,
              body: 'Author could not be resolved.',
              createdBy: undefined,
              createdAt: '2026-03-03T15:00:00Z',
            },
          ],
        }}
        currentUserId={undefined}
        ticketId={1}
        ticketTitle="Login bug"
      />,
    );

    expect(screen.getByText('不明なユーザー')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'コメント 101 を編集' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'コメント 101 を削除' })).toBeNull();
  });
});
