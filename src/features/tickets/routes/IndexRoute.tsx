import { zodResolver } from '@hookform/resolvers/zod';
import { Badge, Button, Group, Paper, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { useTickets } from '#/features/tickets/hooks/useTickets.ts';
import {
  type TicketsSearchFormInput,
  type TicketsSearchFormOutput,
  ticketsSearchFormValuesSchema,
  ticketsSearchSchema,
} from '#/features/tickets/schema/search.ts';
import { formatDateTime } from '#/shared/utils/date.ts';

// TODO: split form and table
export function IndexRoute() {
  const search = useSearch({ from: '/tickets/' });
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketsSearchFormInput, unknown, TicketsSearchFormOutput>({
    defaultValues: search,
    resolver: zodResolver(ticketsSearchFormValuesSchema),
  });

  const { data, isLoading, isError } = useTickets({
    filters: ticketsSearchSchema.parse(search),
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !data) {
    return <div>Error...</div>;
  }

  const { items, total } = data;

  return (
    <Stack gap="lg">
      <Paper p="lg" shadow="sm">
        <form
          onSubmit={handleSubmit((v) => {
            navigate({ to: '/tickets', search: ticketsSearchSchema.parse({ ...v, page: 1 }) });
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
            <Controller
              control={control}
              name="sort"
              render={({ field }) => (
                <Select
                  data={[
                    { label: '作成日（昇順）', value: 'created_at_asc' },
                    { label: '作成日（降順）', value: 'created_at_dsc' },
                    { label: '更新日（昇順）', value: 'updated_at_asc' },
                    { label: '更新日（降順）', value: 'updated_at_dsc' },
                  ]}
                  label="ソート"
                  {...field}
                />
              )}
            />
            <Button type="submit">Search</Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="lg" shadow="sm">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>チケット一覧</Text>
            <Text c="dimmed" size="sm">
              total: {total}
            </Text>
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
                {items.length > 0 ? (
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
        </Stack>
      </Paper>
    </Stack>
  );
}
