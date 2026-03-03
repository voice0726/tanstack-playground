import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { IndexRoute } from '#/features/tickets/routes';
import { TICKETS_SEARCH_DEFAULT, ticketsSearchSchema } from '#/features/tickets/schema/search.ts';

export const Route = createFileRoute('/tickets/')({
  component: IndexRoute,
  validateSearch: ticketsSearchSchema.parse,
  search: {
    middlewares: [stripSearchParams(TICKETS_SEARCH_DEFAULT)],
  },
});
