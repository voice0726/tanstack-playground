import { Button, Group, Text } from '@mantine/core';
import { useState } from 'react';
import {
  TICKETS_SEARCH_DEFAULT,
  type TicketsSearch,
} from '@/features/tickets/schema/search.ts';

export type ActiveTicketFilter = 'q' | 'status' | 'sort';

type ActiveTicketFiltersProps = {
  filters: TicketsSearch;
  onRemove: (filter: ActiveTicketFilter) => void;
};

const sortLabels = {
  id: 'ID',
  created_at: '作成日',
  updated_at: '更新日',
};

export function ActiveTicketFilters({ filters, onRemove }: ActiveTicketFiltersProps) {
  const [visibleFilters, setVisibleFilters] = useState(filters);
  const hasQuery = Boolean(visibleFilters.q);
  const hasStatus = visibleFilters.status !== TICKETS_SEARCH_DEFAULT.status;
  const hasSort =
    visibleFilters.sortBy !== TICKETS_SEARCH_DEFAULT.sortBy ||
    visibleFilters.sortOrder !== TICKETS_SEARCH_DEFAULT.sortOrder;

  if (!hasQuery && !hasStatus && !hasSort) {
    return null;
  }

  return (
    <Group align="center" gap="xs">
      <Text size="sm">適用中の条件:</Text>
      {hasQuery && (
        <Button
          aria-label="タイトル条件を解除"
          size="xs"
          variant="light"
          onClick={() => {
            setVisibleFilters((current) => ({ ...current, q: undefined }));
            onRemove('q');
          }}
        >
          タイトル: {visibleFilters.q} ×
        </Button>
      )}
      {hasStatus && (
        <Button
          aria-label="ステータス条件を解除"
          size="xs"
          variant="light"
          onClick={() => {
            setVisibleFilters((current) => ({ ...current, status: 'all' }));
            onRemove('status');
          }}
        >
          ステータス: {visibleFilters.status === 'open' ? 'Open' : 'Closed'} ×
        </Button>
      )}
      {hasSort && (
        <Button
          aria-label="並び順条件を解除"
          size="xs"
          variant="light"
          onClick={() => {
            setVisibleFilters((current) => ({
              ...current,
              sortBy: TICKETS_SEARCH_DEFAULT.sortBy,
              sortOrder: TICKETS_SEARCH_DEFAULT.sortOrder,
            }));
            onRemove('sort');
          }}
        >
          並び順: {sortLabels[visibleFilters.sortBy]}・
          {visibleFilters.sortOrder === 'asc' ? '昇順' : '降順'} ×
        </Button>
      )}
    </Group>
  );
}
