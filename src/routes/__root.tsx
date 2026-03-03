import '@mantine/core/styles.css';

import { AppShell, Badge, createTheme, Group, MantineProvider, Text, Title } from '@mantine/core';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TICKETS_SEARCH_DEFAULT } from '#/features/tickets/schema/search.ts';

export const Route = createRootRoute({
  component: RootComponent,
});

const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
  fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
});

const appShellBackground =
  'radial-gradient(circle at 8% -12%, #d8f5ee 0%, transparent 40%), radial-gradient(circle at 92% -16%, #dbe9ff 0%, transparent 34%), linear-gradient(180deg, #f7fbff 0%, #f3f7fb 100%)';

function RootComponent() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
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
            <Group gap="md">
              <Link to="/">Home</Link>
              <Link to="/tickets" search={TICKETS_SEARCH_DEFAULT}>
                Tickets
              </Link>
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

      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </MantineProvider>
  );
}
