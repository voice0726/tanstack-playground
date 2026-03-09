import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconClock, IconHistory } from '@tabler/icons-react';
import type {
  Ticket,
  TicketHistory,
  TicketHistoryChange,
} from '#/features/tickets/schema/index.ts';
import { formatDateTime } from '#/shared/utils/date.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';

const FIELD_LABELS: Record<string, string> = {
  status: 'ステータス',
  assignee: '担当者',
  title: 'タイトル',
};

const STATUS_VALUES: Ticket['status'][] = ['open', 'closed'];

const getFieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

function HistoryValue({ change, value }: { change: TicketHistoryChange; value: string | null }) {
  if (change.field === 'status' && value && STATUS_VALUES.includes(value as Ticket['status'])) {
    return <TicketStatusBadge status={value as Ticket['status']} />;
  }

  return (
    <Text fw={500} size="sm">
      {value ?? '未設定'}
    </Text>
  );
}

export function TicketHistoryList({ history }: { history: TicketHistory }) {
  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon color="blue" radius="xl" size="sm" variant="light">
          <IconHistory size={14} />
        </ThemeIcon>
        <Text fw={700}>操作履歴</Text>
      </Group>

      {history.items.length === 0 ? (
        <Paper p="md" radius="md" withBorder>
          <Text c="dimmed" size="sm">
            まだ変更履歴はありません。
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {history.items.map((item) => (
            <Paper key={item.operationId} p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Group gap="xs">
                  <ThemeIcon color="gray" radius="xl" size="sm" variant="light">
                    <IconClock size={14} />
                  </ThemeIcon>
                  <Text fw={600} size="sm">
                    {formatDateTime(item.changedAt)}
                  </Text>
                </Group>

                <Stack gap="xs">
                  {item.changes.map((change) => (
                    <Stack
                      gap={6}
                      key={`${item.operationId}-${change.field}-${change.before ?? 'null'}-${change.after ?? 'null'}`}
                    >
                      <Text c="dimmed" fw={600} size="xs">
                        {getFieldLabel(change.field)}
                      </Text>
                      <Group align="center" gap="xs" wrap="wrap">
                        <HistoryValue change={change} value={change.before} />
                        <ThemeIcon color="gray" radius="xl" size="sm" variant="transparent">
                          <IconArrowRight size={14} />
                        </ThemeIcon>
                        <HistoryValue change={change} value={change.after} />
                      </Group>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
