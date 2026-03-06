import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TicketDeleteModal } from '#/features/tickets/components/TicketDeleteModal.tsx';
import { TicketStatusBadge } from '#/features/tickets/components/TicketStatusBadge.tsx';
import { useDeleteTicket } from '#/features/tickets/hooks/useDeleteTicket.ts';
import { useTickets } from '#/features/tickets/hooks/useTickets.ts';
import type { Ticket } from '#/features/tickets/schema/index.ts';
import {
  type TicketsSearch,
  type TicketsSearchFormInput,
  type TicketsSearchFormOutput,
  ticketsSearchFormValuesSchema,
  ticketsSearchSchema,
} from '#/features/tickets/schema/search.ts';
import { useToast } from '#/shared/ui/toast.tsx';
import { formatDateTime } from '#/shared/utils/date.ts';
import { getErrorMessage } from './helpers.tsx';

const pageSizeOptions = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

// TODO: split form and table
export function IndexRoute() {
  const search = useSearch({ from: '/tickets/' });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const deleteTicket = useDeleteTicket();
  const [deleteTarget, setDeleteTarget] = useState<Pick<Ticket, 'id' | 'title'> | null>(null);

  const normalizedSearch = ticketsSearchSchema.parse(search);
  const updateSearch = (patch: Partial<TicketsSearch>) =>
    ticketsSearchSchema.parse({ ...normalizedSearch, ...patch });
  const searchFormValues = useMemo(
    () =>
      ({
        q: normalizedSearch.q ?? '',
        status: normalizedSearch.status,
        sortBy: normalizedSearch.sortBy,
        sortOrder: normalizedSearch.sortOrder,
      }) satisfies TicketsSearchFormInput,
    [
      normalizedSearch.q,
      normalizedSearch.sortBy,
      normalizedSearch.sortOrder,
      normalizedSearch.status,
    ],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketsSearchFormInput, unknown, TicketsSearchFormOutput>({
    defaultValues: searchFormValues,
    resolver: zodResolver(ticketsSearchFormValuesSchema),
  });

  useEffect(() => {
    reset(searchFormValues);
  }, [reset, searchFormValues]);

  // TODO: keepPreviousData
  const { data, isLoading, isError } = useTickets({
    filters: normalizedSearch,
  });
  const isTableLoading = isLoading;
  const hasTableError = isError || (!isLoading && !data);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / normalizedSearch.pageSize));
  const from =
    total === 0 ? 0 : Math.min((normalizedSearch.page - 1) * normalizedSearch.pageSize + 1, total);
  const to = Math.min(total, normalizedSearch.page * normalizedSearch.pageSize);

  return (
    <Stack gap="lg">
      <Paper p="lg" shadow="sm">
        <form
          onSubmit={handleSubmit((v) => {
            navigate({ to: '/tickets', search: updateSearch({ ...v, page: 1 }) });
          })}
        >
          <Stack gap="md">
            <TextInput label="タイトル" {...register('q')} error={errors.q?.message} />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  data={[
                    { label: '全て', value: 'all' },
                    { label: 'Open', value: 'open' },
                    { label: 'Closed', value: 'closed' },
                  ]}
                  label="ステータス"
                  {...field}
                />
              )}
            />
            <Group grow>
              <Controller
                control={control}
                name="sortBy"
                render={({ field }) => (
                  <Select
                    data={[
                      { label: 'ID', value: 'id' },
                      { label: '作成日', value: 'created_at' },
                      { label: '更新日', value: 'updated_at' },
                    ]}
                    label="ソート項目"
                    {...field}
                  />
                )}
              />
              <Controller
                control={control}
                name="sortOrder"
                render={({ field }) => (
                  <Select
                    data={[
                      { label: '昇順', value: 'asc' },
                      { label: '降順', value: 'dsc' },
                    ]}
                    label="順序"
                    {...field}
                  />
                )}
              />
            </Group>
            <Button type="submit">検索する</Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="lg" shadow="sm">
        <Stack gap="md">
          <Group align="center" justify="space-between" wrap="wrap">
            <Text fw={600}>チケット一覧</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                void navigate({ to: '/tickets/new', search: normalizedSearch });
              }}
              variant="light"
            >
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
                value={String(normalizedSearch.pageSize)}
                w={100}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }

                  navigate({
                    to: '/tickets',
                    search: updateSearch({ page: 1, pageSize: Number(value) }),
                  });
                }}
              />
            </Group>
          </Group>

          <Table.ScrollContainer minWidth={720} type="native">
            <Table highlightOnHover striped withColumnBorders withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>タイトル</Table.Th>
                  <Table.Th>ステータス</Table.Th>
                  <Table.Th>担当者</Table.Th>
                  <Table.Th>作成日</Table.Th>
                  <Table.Th>更新日</Table.Th>
                  <Table.Th>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isTableLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text c="dimmed" ta="center">
                        Loading...
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : hasTableError ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
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
                      <Table.Td>{formatDateTime(ticket.createdAt)}</Table.Td>
                      <Table.Td>{formatDateTime(ticket.updatedAt)}</Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <Button
                            leftSection={<IconEye size={14} />}
                            onClick={() => {
                              void navigate({
                                to: '/tickets/$ticketId',
                                params: { ticketId: String(ticket.id) },
                                search: normalizedSearch,
                              });
                            }}
                            size="xs"
                            variant="light"
                          >
                            詳細
                          </Button>
                          <Button
                            leftSection={<IconEdit size={14} />}
                            onClick={() => {
                              void navigate({
                                to: '/tickets/$ticketId/edit',
                                params: { ticketId: String(ticket.id) },
                                search: normalizedSearch,
                              });
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
                              setDeleteTarget({
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
                    <Table.Td colSpan={7}>
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
            <Pagination
              total={totalPages}
              value={normalizedSearch.page}
              withEdges
              onChange={(page) => {
                navigate({ to: '/tickets', search: updateSearch({ page }) });
              }}
            />
          </Group>
        </Stack>
      </Paper>

      <TicketDeleteModal
        isDeleting={deleteTicket.isPending}
        opened={deleteTarget !== null}
        ticket={deleteTarget}
        onClose={() => {
          if (deleteTicket.isPending) {
            return;
          }

          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }

          deleteTicket.mutate(deleteTarget.id, {
            onError: (error) => {
              showToast({
                title: '削除に失敗しました',
                message: getErrorMessage(error, '再試行してください'),
                color: 'red',
              });
            },
            onSuccess: () => {
              showToast({
                title: 'チケットを削除しました',
                message: `#${deleteTarget.id} ${deleteTarget.title}`,
              });
              setDeleteTarget(null);
            },
          });
        }}
      />
    </Stack>
  );
}
