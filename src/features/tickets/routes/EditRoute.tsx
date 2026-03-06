import { Button, Group, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { TicketForm } from '#/features/tickets/components/TicketForm.tsx';
import { TicketRequestError } from '#/features/tickets/components/TicketRequestError.tsx';
import { useTicket } from '#/features/tickets/hooks/useTicket.ts';
import { useUpdateTicket } from '#/features/tickets/hooks/useUpdateTicket.ts';
import type { TicketFormInput } from '#/features/tickets/schema/form.ts';
import type { TicketsSearch } from '#/features/tickets/schema/search.ts';
import { useToast } from '#/shared/ui/toast.tsx';
import { getErrorMessage, TicketPageLayout, TicketsBackButton } from './helpers.tsx';

const toFormValues = (ticket: {
  title: string;
  status: 'open' | 'closed';
  assignee?: string | null;
}): TicketFormInput => ({
  title: ticket.title,
  status: ticket.status,
  assignee: ticket.assignee ?? '',
});

export function EditRoute({ ticketId, search }: { ticketId: number; search: TicketsSearch }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ticketQuery = useTicket({ id: ticketId });
  const updateTicket = useUpdateTicket();

  const actions = (
    <Group>
      <Button
        component="button"
        onClick={() => {
          void navigate({
            to: '/tickets/$ticketId',
            params: { ticketId: String(ticketId) },
            search,
          });
        }}
        variant="default"
      >
        詳細に戻る
      </Button>
      <TicketsBackButton search={search} />
    </Group>
  );

  return (
    <TicketPageLayout
      title={`チケット #${ticketId} を編集`}
      description="現在のチケット情報を読み込んでから編集します。"
      actions={actions}
    >
      {ticketQuery.isPending ? (
        <Stack gap="xs">
          <Text c="dimmed">チケット情報を読み込んでいます...</Text>
        </Stack>
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
        <TicketForm
          cancelButton={
            <Button
              component="button"
              onClick={() => {
                void navigate({
                  to: '/tickets/$ticketId',
                  params: { ticketId: String(ticketId) },
                  search,
                });
              }}
              variant="default"
            >
              キャンセル
            </Button>
          }
          errorMessage={
            updateTicket.isError
              ? getErrorMessage(updateTicket.error, 'チケットの更新に失敗しました')
              : undefined
          }
          initialValues={toFormValues(ticketQuery.data)}
          isSubmitting={updateTicket.isPending}
          submitLabel="更新する"
          onSubmit={(values) => {
            updateTicket.mutate(
              {
                id: ticketId,
                ...values,
              },
              {
                onError: (error) => {
                  showToast({
                    title: '更新に失敗しました',
                    message: getErrorMessage(error, '入力内容を確認して再試行してください'),
                    color: 'red',
                  });
                },
                onSuccess: (ticket) => {
                  showToast({
                    title: 'チケットを更新しました',
                    message: `#${ticket.id} ${ticket.title}`,
                  });

                  void navigate({
                    to: '/tickets/$ticketId',
                    params: { ticketId: String(ticket.id) },
                    search,
                  });
                },
              },
            );
          }}
        />
      )}
    </TicketPageLayout>
  );
}
