import {
  Button,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession.ts';
import { TicketCommentsPanel } from '@/features/tickets/components/comments/TicketCommentsPanel.tsx';
import { TicketActorInfo } from '@/features/tickets/components/detail/TicketActorInfo.tsx';
import { TicketHistoryList } from '@/features/tickets/components/detail/TicketHistoryList.tsx';
import { TicketStatusBadge } from '@/features/tickets/components/detail/TicketStatusBadge.tsx';
import { TicketDeleteModal } from '@/features/tickets/components/dialogs/TicketDeleteModal.tsx';
import { TicketRequestError } from '@/features/tickets/components/feedback/TicketRequestError.tsx';
import { TicketPageLayout } from '@/features/tickets/components/layout/TicketPageLayout.tsx';
import { TicketsBackButton } from '@/features/tickets/components/layout/TicketsBackButton.tsx';
import { useDeleteTicket } from '@/features/tickets/hooks/useDeleteTicket.ts';
import { useTicket } from '@/features/tickets/hooks/useTicket.ts';
import type { TicketsSearch } from '@/features/tickets/schema/search.ts';
import { getErrorMessage } from '@/features/tickets/utils/getErrorMessage.ts';
import { showToast } from '@/shared/ui/toast.tsx';
import { formatDateTime } from '@/shared/utils/date.ts';

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack gap={4}>
      <Text c="dimmed" fw={600} size="sm">
        {label}
      </Text>
      {typeof value === 'string' ? <Text>{value}</Text> : value}
    </Stack>
  );
}

export function DetailRoute({ ticketId, search }: { ticketId: number; search: TicketsSearch }) {
  const navigate = useNavigate();
  const [deleteOpened, setDeleteOpened] = useState(false);
  const authSession = useAuthSession();
  const ticketQuery = useTicket({ id: ticketId });
  const deleteTicket = useDeleteTicket();

  const actions =
    ticketQuery.data && !ticketQuery.isError ? (
      <Group>
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => {
            void navigate({
              to: '/tickets/$ticketId/edit',
              params: { ticketId: String(ticketId) },
              search,
            });
          }}
          variant="light"
        >
          編集
        </Button>
        <Button
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={() => {
            setDeleteOpened(true);
          }}
          variant="light"
        >
          削除
        </Button>
      </Group>
    ) : (
      <TicketsBackButton search={search} />
    );

  return (
    <TicketPageLayout
      title={`チケット #${ticketId}`}
      description="チケットの状態を確認し、編集や削除に進めます。"
      actions={actions}
    >
      <Stack gap="lg">
        <UnstyledButton
          onClick={() => {
            void navigate({ to: '/tickets', search });
          }}
        >
          <Group gap="xs">
            <ThemeIcon color="gray" radius="xl" size="sm" variant="light">
              <IconChevronLeft size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              一覧に戻る
            </Text>
          </Group>
        </UnstyledButton>

        {ticketQuery.isPending ? (
          <Text c="dimmed">チケット情報を読み込んでいます...</Text>
        ) : ticketQuery.isError || !ticketQuery.data ? (
          <TicketRequestError
            message={getErrorMessage(ticketQuery.error, 'チケット情報の取得に失敗しました')}
            secondaryAction={<TicketsBackButton search={search} />}
            title="チケットを表示できません"
            onRetry={() => {
              void ticketQuery.refetch();
            }}
          />
        ) : (
          <>
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text c="dimmed" size="sm">
                    チケット #{ticketQuery.data.id}
                  </Text>
                  <Text fw={700} size="xl">
                    {ticketQuery.data.title}
                  </Text>
                </div>
                <TicketStatusBadge status={ticketQuery.data.status} />
              </Group>
              <Text c="dimmed">
                担当者: {ticketQuery.data.assignee ? ticketQuery.data.assignee : '未設定'}
              </Text>
            </Stack>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <DetailItem
                label="作成者"
                value={
                  <TicketActorInfo actor={ticketQuery.data.createdBy} fallback="不明なユーザー" />
                }
              />
              <DetailItem
                label="更新者"
                value={
                  <TicketActorInfo actor={ticketQuery.data.updatedBy} fallback="不明なユーザー" />
                }
              />
              <DetailItem label="作成日時" value={formatDateTime(ticketQuery.data.createdAt)} />
              <DetailItem label="更新日時" value={formatDateTime(ticketQuery.data.updatedAt)} />
            </SimpleGrid>

            <Divider />

            <TicketHistoryList history={ticketQuery.data.history} />

            <Divider />

            <TicketCommentsPanel
              comments={ticketQuery.data.comments}
              currentUserId={authSession.data?.id}
              ticketId={ticketQuery.data.id}
              ticketTitle={ticketQuery.data.title}
            />

            <TicketDeleteModal
              isDeleting={deleteTicket.isPending}
              opened={deleteOpened}
              ticket={{
                id: ticketQuery.data.id,
                title: ticketQuery.data.title,
              }}
              onClose={() => {
                if (deleteTicket.isPending) {
                  return;
                }

                setDeleteOpened(false);
              }}
              onConfirm={() => {
                deleteTicket.mutate(ticketQuery.data.id, {
                  onError: (error) => {
                    showToast({
                      title: '削除に失敗しました',
                      message: getErrorMessage(error, '再試行してください'),
                      color: 'red',
                    });
                  },
                  onSuccess: () => {
                    setDeleteOpened(false);
                    showToast({
                      title: 'チケットを削除しました',
                      message: `#${ticketQuery.data.id} ${ticketQuery.data.title}`,
                    });
                    void navigate({ to: '/tickets', search });
                  },
                });
              }}
            />
          </>
        )}
      </Stack>
    </TicketPageLayout>
  );
}
