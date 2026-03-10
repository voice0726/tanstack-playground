import '@mantine/core/styles.css';

import {
  AppShell,
  Badge,
  Button,
  createTheme,
  Group,
  MantineProvider,
  Text,
  Title,
} from '@mantine/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { AuthRedirectController } from '#/features/auth/components/AuthRedirectController.tsx';
import { useAuthSession } from '#/features/auth/hooks/useAuthSession.ts';
import { useLogout } from '#/features/auth/hooks/useLogout.ts';
import { TICKETS_SEARCH_DEFAULT } from '#/features/tickets/schema/search.ts';
import { env } from '#/shared/config/env.ts';
import { ToastProvider } from '#/shared/ui/toast.tsx';
import type { RouterContext } from '@/router';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'sm',
  fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
});

const appShellBackground =
  'radial-gradient(circle at 8% -12%, #d8f5ee 0%, transparent 40%), radial-gradient(circle at 92% -16%, #dbe9ff 0%, transparent 34%), linear-gradient(180deg, #f7fbff 0%, #f3f7fb 100%)';

function RootComponent() {
  const shouldRenderDevtools = env.MODE === 'development';
  const authSession = useAuthSession();
  const logout = useLogout();
  const currentUser = authSession.data;

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ToastProvider>
        <AuthRedirectController />
        <AppShell
          header={{ height: 72 }}
          mih="100dvh"
          padding="lg"
          style={{ background: appShellBackground }}
        >
          <AppShell.Header>
            <Group h="100%" justify="space-between" px="lg">
              <Group gap="sm">
                <Badge color="teal" variant="light">
                  Migration
                </Badge>
                <Title order={4}>TanStack Playground</Title>
              </Group>

              <Group gap="lg">
                <Group gap="md">
                  <Link to="/">Home</Link>
                  {currentUser ? (
                    <Link to="/tickets" search={TICKETS_SEARCH_DEFAULT}>
                      Tickets
                    </Link>
                  ) : null}
                </Group>

                {authSession.isPending ? (
                  <Text c="dimmed" size="sm">
                    認証状態を確認中...
                  </Text>
                ) : currentUser ? (
                  <Group gap="sm">
                    <Text size="sm">{currentUser.displayName}</Text>
                    <Button
                      loading={logout.isPending}
                      size="xs"
                      variant="light"
                      onClick={() => {
                        logout.mutate();
                      }}
                    >
                      ログアウト
                    </Button>
                  </Group>
                ) : (
                  <Text c="dimmed" size="sm">
                    トップページからログインできます
                  </Text>
                )}
              </Group>
            </Group>
          </AppShell.Header>

          <AppShell.Main>
            <Outlet />
            <Text c="dimmed" mt="xl" size="sm">
              Tailwind pages were replaced with temporary Mantine pages.
            </Text>
          </AppShell.Main>
        </AppShell>

        {shouldRenderDevtools ? (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'TanStack Query',
                render: <ReactQueryDevtoolsPanel />,
              },
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
      </ToastProvider>
    </MantineProvider>
  );
}
