import { create } from 'zustand';
import { initialDndTableItems } from '@/features/dnd-table/data/sampleItems.ts';
import type { DndTableItem } from '@/features/dnd-table/schema.ts';

type DndTableState = {
  filter: string;
  isDirty: boolean;
  itemsById: Record<string, DndTableItem>;
  orderedIds: string[];
  selectedId: string | null;
};

type DndTableActions = {
  reorderRows: (activeId: string, overId: string | null) => void;
  reset: () => void;
  selectRow: (id: string) => void;
  setFilter: (filter: string) => void;
};

export type DndTableStore = DndTableState & DndTableActions;

const createInitialState = (): DndTableState => ({
  filter: '',
  isDirty: false,
  itemsById: Object.fromEntries(initialDndTableItems.map((item) => [item.id, item])),
  orderedIds: initialDndTableItems.map((item) => item.id),
  selectedId: initialDndTableItems[0]?.id ?? null,
});

const moveItem = (ids: string[], fromIndex: number, toIndex: number) => {
  const nextIds = [...ids];
  const [movedId] = nextIds.splice(fromIndex, 1);

  if (!movedId) {
    return ids;
  }

  nextIds.splice(toIndex, 0, movedId);

  return nextIds;
};

export const useDndTableStore = create<DndTableStore>()((set) => ({
  ...createInitialState(),
  reorderRows: (activeId, overId) =>
    set((state) => {
      if (!overId || activeId === overId) {
        return state;
      }

      const fromIndex = state.orderedIds.indexOf(activeId);
      const toIndex = state.orderedIds.indexOf(overId);

      if (fromIndex === -1 || toIndex === -1) {
        return state;
      }

      return {
        orderedIds: moveItem(state.orderedIds, fromIndex, toIndex),
        isDirty: true,
      };
    }),
  reset: () => set(createInitialState()),
  selectRow: (id) =>
    set((state) => {
      if (!state.itemsById[id]) {
        return state;
      }

      return { selectedId: id };
    }),
  setFilter: (filter) => set({ filter }),
}));

export const resetDndTableStore = () => {
  useDndTableStore.setState(createInitialState());
};
