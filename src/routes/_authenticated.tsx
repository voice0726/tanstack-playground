import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authSessionQueryOptions } from '#/features/auth/hooks/useAuthSession.ts';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery({
      ...authSessionQueryOptions(),
      staleTime: 0,
    });

    if (!user) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
