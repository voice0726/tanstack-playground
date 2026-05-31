import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import type { DndTableItem, DndTableStatus } from '@/features/dnd-table/schema.ts';

const statusLabels: Record<DndTableStatus, string> = {
  blocked: 'Blocked',
  ready: 'Ready',
  review: 'Review',
};

const statusColors: Record<DndTableStatus, string> = {
  blocked: 'red',
  ready: 'teal',
  review: 'blue',
};

type DndDataTableProps = {
  items: DndTableItem[];
  selectedId: string | null;
  onReorder: (activeId: string, overId: string | null) => void;
  onSelect: (id: string) => void;
};

export function DndDataTable({ items, selectedId, onReorder, onSelect }: DndDataTableProps) {
  const columns = useMemo<ColumnDef<DndTableItem>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'タスク',
        cell: ({ row }) => (
          <div>
            <Text fw={600} size="sm">
              {row.original.title}
            </Text>
            <Text c="dimmed" size="xs">
              {row.original.id}
            </Text>
          </div>
        ),
      },
      {
        accessorKey: 'owner',
        header: '担当',
      },
      {
        accessorKey: 'status',
        header: '状態',
        cell: ({ getValue }) => {
          const status = getValue<DndTableStatus>();

          return (
            <Badge color={statusColors[status]} variant="light">
              {statusLabels[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: '優先度',
      },
      {
        accessorKey: 'estimate',
        header: '見積',
        cell: ({ getValue }) => `${getValue<number>()} pt`,
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    onReorder(String(active.id), over ? String(over.id) : null);
  };

  if (items.length === 0) {
    return (
      <Table.ScrollContainer minWidth={760}>
        <Table highlightOnHover withColumnBorders withRowBorders>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                <Table.Th w={56}>
                  <Text c="dimmed" size="xs">
                    移動
                  </Text>
                </Table.Th>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={columns.length + 1}>
                <Text c="dimmed" py="lg" ta="center">
                  条件に一致するタスクはありません。
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <Table.ScrollContainer minWidth={760}>
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  <Table.Th w={56}>
                    <Text c="dimmed" size="xs">
                      移動
                    </Text>
                  </Table.Th>
                  {headerGroup.headers.map((header) => (
                    <Table.Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.map((row) => (
                <SortableTableRow
                  isSelected={row.original.id === selectedId}
                  key={row.id}
                  row={row}
                  onSelect={onSelect}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </SortableContext>
    </DndContext>
  );
}

type SortableTableRowProps = {
  isSelected: boolean;
  row: Row<DndTableItem>;
  onSelect: (id: string) => void;
};

function SortableTableRow({ isSelected, row, onSelect }: SortableTableRowProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.original.id });

  return (
    <Table.Tr
      ref={setNodeRef}
      bg={isSelected ? 'teal.0' : undefined}
      style={{
        opacity: isDragging ? 0.72 : 1,
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
      }}
      onClick={() => {
        onSelect(row.original.id);
      }}
    >
      <Table.Td>
        <Group justify="center">
          <Tooltip label="行を並び替え">
            <ActionIcon
              ref={setActivatorNodeRef}
              aria-label={`${row.original.title} を並び替え`}
              color="gray"
              size="sm"
              variant="subtle"
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
      {row.getVisibleCells().map((cell) => (
        <Table.Td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Table.Td>
      ))}
    </Table.Tr>
  );
}
