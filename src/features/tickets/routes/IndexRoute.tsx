import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
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
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { useTickets } from '#/features/tickets/hooks/useTickets.ts';
import {
  type TicketsSearch,
  type TicketsSearchFormInput,
  type TicketsSearchFormOutput,
  ticketsSearchFormValuesSchema,
  ticketsSearchSchema,
} from '#/features/tickets/schema/search.ts';
import { formatDateTime } from '#/shared/utils/date.ts';

const pageSizeOptions = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

// TODO: split form and table
export function IndexRoute() {
  const search = useSearch({ from: '/tickets/' });
  const navigate = useNavigate();

  const normalizedSearch = ticketsSearchSchema.parse(search);
  const updateSearch = (patch: Partial<TicketsSearch>) =>
    ticketsSearchSchema.parse({ ...normalizedSearch, ...patch });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketsSearchFormInput, unknown, TicketsSearchFormOutput>({
    values: { ...normalizedSearch, q: normalizedSearch.q ?? '' },
    resolver: zodResolver(ticketsSearchFormValuesSchema),
  });

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
            <TextInput label="Title" {...register('q')} error={errors.q?.message} />
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
            <Button type="submit">Search</Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="lg" shadow="sm">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Text fw={600}>チケット一覧</Text>
            <Group gap="sm">
              <Text c="dimmed" size="sm">
                total: {total}
              </Text>
              <Select
                allowDeselect={false}
                data={pageSizeOptions}
                label="表示件数"
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
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isTableLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed" ta="center">
                        Loading...
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : hasTableError ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
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
                        <Badge color={ticket.status === 'open' ? 'teal' : 'gray'} variant="light">
                          {ticket.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{ticket.assignee ?? '-'}</Table.Td>
                      <Table.Td>{formatDateTime(ticket.createdAt)}</Table.Td>
                      <Table.Td>{formatDateTime(ticket.updatedAt)}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
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
    </Stack>
  );
}
