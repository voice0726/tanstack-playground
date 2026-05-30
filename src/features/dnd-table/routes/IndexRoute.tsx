import { Button, Card, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { useMemo } from 'react';
import { DndDataTable } from '@/features/dnd-table/components/DndDataTable.tsx';
import { useDndTableStore } from '@/features/dnd-table/store/useDndTableStore.ts';

export function IndexRoute() {
  const filter = useDndTableStore((state) => state.filter);
  const isDirty = useDndTableStore((state) => state.isDirty);
  const itemsById = useDndTableStore((state) => state.itemsById);
  const orderedIds = useDndTableStore((state) => state.orderedIds);
  const selectedId = useDndTableStore((state) => state.selectedId);
  const reorderRows = useDndTableStore((state) => state.reorderRows);
  const reset = useDndTableStore((state) => state.reset);
  const selectRow = useDndTableStore((state) => state.selectRow);
  const setFilter = useDndTableStore((state) => state.setFilter);

  const orderedItems = useMemo(
    () => orderedIds.map((id) => itemsById[id]).filter((item) => item !== undefined),
    [itemsById, orderedIds],
  );
  const normalizedFilter = filter.trim().toLowerCase();
  const visibleItems = useMemo(
    () =>
      normalizedFilter
        ? orderedItems.filter((item) =>
            [item.title, item.owner, item.status, item.priority]
              .join(' ')
              .toLowerCase()
              .includes(normalizedFilter),
          )
        : orderedItems,
    [normalizedFilter, orderedItems],
  );
  const selectedItem = selectedId ? itemsById[selectedId] : null;

  return (
    <Stack gap="lg">
      <Group align="flex-start" justify="space-between">
        <div>
          <Text c="dimmed" fw={700} size="sm" tt="uppercase">
            Local state playground
          </Text>
          <Title order={1} mt="xs">
            DnD Table
          </Title>
          <Text c="dimmed" mt="sm">
            TanStack Table の行を dnd kit で並び替え、画面状態は zustand で保持します。
          </Text>
        </div>
        <Button
          color={isDirty ? 'teal' : 'gray'}
          disabled={!isDirty && filter.length === 0 && selectedId === orderedIds[0]}
          leftSection={<IconRefresh size={16} />}
          variant={isDirty ? 'filled' : 'light'}
          onClick={reset}
        >
          リセット
        </Button>
      </Group>

      <Paper p="lg" shadow="sm">
        <Group align="flex-end" justify="space-between">
          <TextInput
            leftSection={<IconSearch size={16} />}
            maw={420}
            placeholder="タスク、担当、状態、優先度で絞り込み"
            value={filter}
            w="100%"
            onChange={(event) => {
              setFilter(event.currentTarget.value);
            }}
          />
          <Text c="dimmed" size="sm">
            {visibleItems.length} / {orderedItems.length} 件
          </Text>
        </Group>
      </Paper>

      <Card withBorder p={0} radius="md" shadow="sm">
        <DndDataTable
          items={visibleItems}
          selectedId={selectedId}
          onReorder={reorderRows}
          onSelect={selectRow}
        />
      </Card>

      <Paper p="lg" shadow="sm">
        {selectedItem ? (
          <Group justify="space-between">
            <div>
              <Text fw={700}>{selectedItem.title}</Text>
              <Text c="dimmed" size="sm">
                {selectedItem.owner} / {selectedItem.priority} / {selectedItem.estimate} pt
              </Text>
            </div>
            <Text c={isDirty ? 'teal' : 'dimmed'} fw={700} size="sm">
              {isDirty ? '並び順が変更されています' : '初期の並び順です'}
            </Text>
          </Group>
        ) : (
          <Text c="dimmed">行を選択すると概要が表示されます。</Text>
        )}
      </Paper>
    </Stack>
  );
}
