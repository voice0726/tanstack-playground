import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IndexRoute } from '@/features/dnd-table/routes/IndexRoute.tsx';
import {
  resetDndTableStore,
  useDndTableStore,
} from '@/features/dnd-table/store/useDndTableStore.ts';

const renderRoute = () =>
  render(
    <MantineProvider env="test">
      <IndexRoute />
    </MantineProvider>,
  );

describe('DnD table route', () => {
  beforeEach(() => {
    resetDndTableStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders local state table rows', () => {
    renderRoute();

    expect(screen.getByRole('heading', { name: 'DnD Table' })).not.toBeNull();
    expect(screen.getAllByText('認証フローの確認')).toHaveLength(2);
    expect(screen.getByText('Router 移行メモの整理')).not.toBeNull();
  });

  it('filters rows by the local zustand state', () => {
    renderRoute();

    fireEvent.change(screen.getByPlaceholderText('タスク、担当、状態、優先度で絞り込み'), {
      target: { value: 'router' },
    });

    const table = screen.getByRole('table');

    expect(within(table).getByText('Router 移行メモの整理')).not.toBeNull();
    expect(within(table).queryByText('認証フローの確認')).toBeNull();
    expect(useDndTableStore.getState().filter).toBe('router');
  });

  it('hides the selected row summary when the filter excludes it', () => {
    useDndTableStore.getState().selectRow('task-query-cache');

    renderRoute();

    expect(screen.getByText('Ren / High / 5 pt')).not.toBeNull();

    fireEvent.change(screen.getByPlaceholderText('タスク、担当、状態、優先度で絞り込み'), {
      target: { value: 'router' },
    });

    expect(screen.queryByText('Ren / High / 5 pt')).toBeNull();
    expect(screen.getByText('行を選択すると概要が表示されます。')).not.toBeNull();
  });

  it('selects a row and resets the changed order', () => {
    const initialIds = useDndTableStore.getState().orderedIds;
    useDndTableStore.getState().reorderRows(initialIds[0] ?? '', initialIds[2] ?? null);

    renderRoute();

    fireEvent.click(screen.getAllByText('Query cache の無効化条件を見直す')[0] as HTMLElement);
    expect(useDndTableStore.getState().selectedId).toBe('task-query-cache');
    expect(screen.getByText('並び順が変更されています')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'リセット' }));

    expect(useDndTableStore.getState().orderedIds).toEqual(initialIds);
    expect(screen.getByText('初期の並び順です')).not.toBeNull();
  });
});
