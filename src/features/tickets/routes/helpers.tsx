import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';

export const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const parseTicketId = (ticketIdParam: string) => {
  const ticketId = Number(ticketIdParam);

  return Number.isInteger(ticketId) && ticketId > 0 ? ticketId : null;
};

export function TicketPageLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack gap="lg" maw={880}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text c="dimmed" fw={700} size="sm" tt="uppercase">
            Tickets
          </Text>
          <Title mt="xs" order={2}>
            {title}
          </Title>
          <Text c="dimmed" mt={6}>
            {description}
          </Text>
        </div>
        {actions}
      </Group>
      <Paper p="lg" radius="md" shadow="sm">
        {children}
      </Paper>
    </Stack>
  );
}

export function TicketsBackButton({ search }: { search: TicketsSearch }) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        void navigate({ to: '/tickets', search });
      }}
      variant="default"
    >
      一覧に戻る
    </Button>
  );
}
