import { createFileRoute } from '@tanstack/react-router';
import { IndexRoute } from '#/features/tickets/routes';

export const Route = createFileRoute('/tickets/')({
  component: IndexRoute,
});
