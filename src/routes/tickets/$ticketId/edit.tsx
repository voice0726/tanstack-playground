import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { TicketRequestError } from '#/features/tickets/components/TicketRequestError.tsx';
import { EditRoute } from '#/features/tickets/routes/EditRoute.tsx';
import {
  parseTicketId,
  TicketPageLayout,
  TicketsBackButton,
} from '#/features/tickets/routes/helpers.tsx';
import { TICKETS_SEARCH_DEFAULT, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';

export const Route = createFileRoute('/tickets/$ticketId/edit')({
  component: RouteComponent,
  validateSearch: ticketsSearchSchema.parse,
  search: {
    middlewares: [stripSearchParams(TICKETS_SEARCH_DEFAULT)],
  },
});

function RouteComponent() {
  const { ticketId: ticketIdParam } = Route.useParams();
  const search = Route.useSearch();
  const ticketId = parseTicketId(ticketIdParam);

  if (ticketId === null) {
    return (
      <TicketPageLayout
        title="チケットを編集できません"
        description="URL に含まれるチケットIDが不正です。"
      >
        <TicketRequestError
          message="有効なチケットIDを指定して再度アクセスしてください。"
          secondaryAction={<TicketsBackButton search={search} />}
          title="不正なチケットIDです"
        />
      </TicketPageLayout>
    );
  }

  return <EditRoute search={search} ticketId={ticketId} />;
}
