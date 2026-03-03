import { Alert, Button, Card, Group, List, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <Stack gap="lg" maw={840}>
      <div>
        <Text c="dimmed" fw={700} size="sm" tt="uppercase">
          Temporary Screen
        </Text>
        <Title order={1} mt="xs">
          Mantine migration placeholder
        </Title>
        <Text c="dimmed" mt="sm">
          Tailwind based pages were removed. We can now redesign this screen with Mantine
          components.
        </Text>
      </div>

      <Card withBorder p="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Text fw={600}>Next steps</Text>
          <List
            spacing="xs"
            icon={
              <ThemeIcon color="teal" radius="xl" size={20}>
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            <List.Item>index route design cleanup</List.Item>
            <List.Item>component structure split</List.Item>
            <List.Item>theme token definition</List.Item>
          </List>
          <Group>
            <Button
              component="a"
              href="https://mantine.dev/core/getting-started/"
              rel="noreferrer"
              target="_blank"
              variant="light"
            >
              Open Mantine docs
            </Button>
          </Group>
        </Stack>
      </Card>

      <Alert color="teal" title="Status" variant="light">
        Routing is simplified to only the home page.
      </Alert>
    </Stack>
  );
}
