import { beforeEach, describe, expect, it } from 'vitest';
import {
  resetDndTableStore,
  useDndTableStore,
} from '@/features/dnd-table/store/useDndTableStore.ts';

describe('useDndTableStore', () => {
  beforeEach(() => {
    resetDndTableStore();
  });

  it('reorders rows by stable ids', () => {
    const initialIds = useDndTableStore.getState().orderedIds;

    useDndTableStore.getState().reorderRows(initialIds[0] ?? '', initialIds[2] ?? null);

    expect(useDndTableStore.getState().orderedIds).toEqual([
      initialIds[1],
      initialIds[2],
      initialIds[0],
      initialIds[3],
      initialIds[4],
    ]);
    expect(useDndTableStore.getState().isDirty).toBe(true);
  });

  it('ignores invalid reorder targets', () => {
    const initialState = useDndTableStore.getState();

    initialState.reorderRows(initialState.orderedIds[0] ?? '', 'missing-row');

    expect(useDndTableStore.getState().orderedIds).toEqual(initialState.orderedIds);
    expect(useDndTableStore.getState().isDirty).toBe(false);
  });

  it('resets local state to the initial view', () => {
    const initialIds = useDndTableStore.getState().orderedIds;

    useDndTableStore.getState().setFilter('router');
    useDndTableStore.getState().selectRow(initialIds[2] ?? '');
    useDndTableStore.getState().reorderRows(initialIds[0] ?? '', initialIds[3] ?? null);

    useDndTableStore.getState().reset();

    expect(useDndTableStore.getState()).toMatchObject({
      filter: '',
      isDirty: false,
      orderedIds: initialIds,
      selectedId: initialIds[0],
    });
  });
});
