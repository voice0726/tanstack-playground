import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { CreateRoute } from '#/features/tickets/routes/CreateRoute.tsx';
import { TICKETS_SEARCH_DEFAULT, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';

export const Route = createFileRoute('/_authenticated/tickets/new')({
  component: RouteComponent,
  validateSearch: ticketsSearchSchema.parse,
  search: {
    middlewares: [stripSearchParams(TICKETS_SEARCH_DEFAULT)],
  },
});

function RouteComponent() {
  const search = Route.useSearch();

  return <CreateRoute search={search} />;
}
