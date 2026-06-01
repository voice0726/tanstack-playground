import { useNavigate } from '@tanstack/react-router';
import { TicketForm } from '@/features/tickets/components/forms/TicketForm.tsx';
import { TicketPageLayout } from '@/features/tickets/components/layout/TicketPageLayout.tsx';
import { TicketsBackButton } from '@/features/tickets/components/layout/TicketsBackButton.tsx';
import { useCreateTicket } from '@/features/tickets/hooks/useCreateTicket.ts';
import { TICKET_FORM_DEFAULT_VALUES } from '@/features/tickets/schema/form.ts';
import type { TicketsSearch } from '@/features/tickets/schema/search.ts';
import { getErrorMessage } from '@/features/tickets/utils/getErrorMessage.ts';
import { showToast } from '@/shared/ui/toast.tsx';

export function CreateRoute({ search }: { search: TicketsSearch }) {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  return (
    <TicketPageLayout
      title="新規チケット"
      description="フォームを送信すると作成したチケットの詳細ページへ遷移します。"
      actions={<TicketsBackButton search={search} />}
    >
      <TicketForm
        cancelButton={<TicketsBackButton search={search} />}
        errorMessage={
          createTicket.isError
            ? getErrorMessage(createTicket.error, 'チケットの作成に失敗しました')
            : undefined
        }
        initialValues={TICKET_FORM_DEFAULT_VALUES}
        isSubmitting={createTicket.isPending}
        submitLabel="作成する"
        onSubmit={(values) => {
          createTicket.mutate(values, {
            onError: (error) => {
              showToast({
                title: '作成に失敗しました',
                message: getErrorMessage(error, '入力内容を確認して再試行してください'),
                color: 'red',
              });
            },
            onSuccess: (ticket) => {
              showToast({
                title: 'チケットを作成しました',
                message: `#${ticket.id} ${ticket.title}`,
              });

              void navigate({
                to: '/tickets/$ticketId',
                params: { ticketId: String(ticket.id) },
                search,
              });
            },
          });
        }}
      />
    </TicketPageLayout>
  );
}
