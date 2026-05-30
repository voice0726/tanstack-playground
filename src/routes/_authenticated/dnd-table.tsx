import { createFileRoute } from '@tanstack/react-router';
import { IndexRoute } from '@/features/dnd-table/routes/IndexRoute.tsx';

export const Route = createFileRoute('/_authenticated/dnd-table')({
  component: IndexRoute,
});
