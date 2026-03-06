import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { TicketRequestError } from '#/features/tickets/components/TicketRequestError.tsx';
import { DetailRoute } from '#/features/tickets/routes/DetailRoute.tsx';
import {
  parseTicketId,
  TicketPageLayout,
  TicketsBackButton,
} from '#/features/tickets/routes/helpers.tsx';
import { TICKETS_SEARCH_DEFAULT, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';

export const Route = createFileRoute('/tickets/$ticketId/')({
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
        title="チケットを表示できません"
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

  return <DetailRoute search={search} ticketId={ticketId} />;
}
