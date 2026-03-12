import { Button, Group, Pagination, Paper, Select, Stack, Table, Text } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { TicketActorInfo } from '#/features/tickets/components/detail/TicketActorInfo.tsx';
import { TicketStatusBadge } from '#/features/tickets/components/detail/TicketStatusBadge.tsx';
import type { Ticket } from '#/features/tickets/schema/index.ts';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';
import { formatDateTime } from '#/shared/utils/date.ts';

type TicketsListPanelProps = {
  items: Ticket[];
  total: number;
  from: number;
  to: number;
  totalPages: number;
  search: TicketsSearch;
  isFetching: boolean;
  isLoading: boolean;
  hasError: boolean;
  pageSizeOptions: { label: string; value: string }[];
  onCreate: () => void;
  onView: (ticketId: number) => void;
  onEdit: (ticketId: number) => void;
  onDelete: (ticket: Pick<Ticket, 'id' | 'title'>) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function TicketsListPanel({
  items,
  total,
  from,
  to,
  totalPages,
  search,
  isFetching,
  isLoading,
  hasError,
  pageSizeOptions,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: TicketsListPanelProps) {
  return (
    <Paper p="lg" shadow="sm">
      <Stack gap="md">
        <Group align="center" justify="space-between" wrap="wrap">
          <Group align="center" gap="xs">
            <Text fw={600}>チケット一覧</Text>
            {isFetching ? (
              <Text aria-live="polite" c="dimmed" size="sm">
                更新中...
              </Text>
            ) : null}
          </Group>
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate} variant="light">
            新規作成
          </Button>
        </Group>

        <Group justify="flex-end" wrap="wrap">
          <Group align="center" gap="sm" justify="flex-end">
            <Text c="dimmed" size="sm">
              total: {total}
            </Text>
            <Text c="dimmed" size="sm">
              表示件数
            </Text>
            <Select
              allowDeselect={false}
              aria-label="表示件数"
              data={pageSizeOptions}
              value={String(search.pageSize)}
              w={100}
              onChange={(value) => {
                if (!value) {
                  return;
                }

                onPageSizeChange(Number(value));
              }}
            />
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={960} type="native">
          <Table highlightOnHover striped withColumnBorders withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>タイトル</Table.Th>
                <Table.Th>ステータス</Table.Th>
                <Table.Th>担当者</Table.Th>
                <Table.Th>作成者</Table.Th>
                <Table.Th>更新者</Table.Th>
                <Table.Th>作成日</Table.Th>
                <Table.Th>更新日</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text c="dimmed" ta="center">
                      Loading...
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : hasError ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text c="red" ta="center">
                      チケット一覧の取得に失敗しました
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : items.length > 0 ? (
                items.map((ticket) => (
                  <Table.Tr key={ticket.id}>
                    <Table.Td>{ticket.id}</Table.Td>
                    <Table.Td>{ticket.title}</Table.Td>
                    <Table.Td>
                      <TicketStatusBadge status={ticket.status} />
                    </Table.Td>
                    <Table.Td>{ticket.assignee ?? '-'}</Table.Td>
                    <Table.Td>
                      <TicketActorInfo actor={ticket.createdBy} fallback="-" />
                    </Table.Td>
                    <Table.Td>
                      <TicketActorInfo actor={ticket.updatedBy} fallback="-" />
                    </Table.Td>
                    <Table.Td>{formatDateTime(ticket.createdAt)}</Table.Td>
                    <Table.Td>{formatDateTime(ticket.updatedAt)}</Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Button
                          leftSection={<IconEye size={14} />}
                          onClick={() => {
                            onView(ticket.id);
                          }}
                          size="xs"
                          variant="light"
                        >
                          詳細
                        </Button>
                        <Button
                          leftSection={<IconEdit size={14} />}
                          onClick={() => {
                            onEdit(ticket.id);
                          }}
                          size="xs"
                          variant="default"
                        >
                          編集
                        </Button>
                        <Button
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => {
                            onDelete({
                              id: ticket.id,
                              title: ticket.title,
                            });
                          }}
                          size="xs"
                          variant="subtle"
                        >
                          削除
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text c="dimmed" ta="center">
                      表示できるチケットがありません
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="space-between" wrap="wrap">
          <Text c="dimmed" size="sm">
            {from}-{to} / {total}
          </Text>
          <Pagination total={totalPages} value={search.page} withEdges onChange={onPageChange} />
        </Group>
      </Stack>
    </Paper>
  );
}
