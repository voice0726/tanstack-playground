import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TicketForm } from './TicketForm';

const renderTicketForm = (ui: ReactNode) => render(<MantineProvider>{ui}</MantineProvider>);

afterEach(() => {
  cleanup();
});

describe('TicketForm', () => {
  it('keeps user input when unrelated props change', () => {
    const onSubmit = vi.fn();
    const initialValues = {
      title: 'Login bug',
      status: 'open' as const,
      assignee: 'aki',
    };
    const { rerender } = renderTicketForm(
      <TicketForm
        errorMessage={undefined}
        initialValues={initialValues}
        isSubmitting={false}
        submitLabel="更新する"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'Login bug resolved' },
    });

    rerender(
      <MantineProvider>
        <TicketForm
          errorMessage="保存に失敗しました"
          initialValues={initialValues}
          isSubmitting={false}
          submitLabel="更新する"
          onSubmit={onSubmit}
        />
      </MantineProvider>,
    );

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe(
      'Login bug resolved',
    );
  });

  it('resets the form when initialValues change', () => {
    const onSubmit = vi.fn();
    const { rerender } = renderTicketForm(
      <TicketForm
        initialValues={{
          title: 'Login bug',
          status: 'open',
          assignee: 'aki',
        }}
        isSubmitting={false}
        submitLabel="更新する"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'temporary draft' },
    });

    rerender(
      <MantineProvider>
        <TicketForm
          initialValues={{
            title: 'Add pagination',
            status: 'closed',
            assignee: 'mika',
          }}
          isSubmitting={false}
          submitLabel="更新する"
          onSubmit={onSubmit}
        />
      </MantineProvider>,
    );

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('Add pagination');
    expect((screen.getByLabelText('担当者') as HTMLInputElement).value).toBe('mika');
  });
});
