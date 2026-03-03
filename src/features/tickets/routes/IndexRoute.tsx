import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Paper, Select, Stack, TextInput } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import {
  type TicketsSearchFormInput,
  type TicketsSearchFormOutput,
  ticketsSearchFormValuesSchema,
} from '#/features/tickets/schema/search.ts';

export function IndexRoute() {
  const search = useSearch({ from: '/tickets/' });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketsSearchFormInput, unknown, TicketsSearchFormOutput>({
    defaultValues: search,
    resolver: zodResolver(ticketsSearchFormValuesSchema),
  });

  return (
    <Paper p="lg" shadow="sm">
      <form
        onSubmit={handleSubmit((v) => {
          console.log(v);
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
  );
}
