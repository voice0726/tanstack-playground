import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconLock, IconTicket } from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useAuthSession } from '#/features/auth/hooks/useAuthSession.ts';
import { useLogin } from '#/features/auth/hooks/useLogin.ts';
import { useLogout } from '#/features/auth/hooks/useLogout.ts';
import { type LoginRequest, loginRequestSchema } from '#/features/auth/schema.ts';
import { TICKETS_SEARCH_DEFAULT } from '#/features/tickets/schema/search.ts';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const navigate = useNavigate({ from: '/' });
  const authSession = useAuthSession();
  const login = useLogin();
  const logout = useLogout();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginRequestSchema),
  });

  return (
    <Stack gap="lg" maw={840}>
      <div>
        <Text c="dimmed" fw={700} size="sm" tt="uppercase">
          Authentication
        </Text>
        <Title order={1} mt="xs">
          TanStack Playground
        </Title>
        <Text c="dimmed" mt="sm">
          バックエンドのセッション Cookie を使ってログインし、認証が必要な画面へ進みます。
        </Text>
      </div>

      {authSession.isPending ? (
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Text c="dimmed">ログイン状態を確認しています...</Text>
        </Card>
      ) : authSession.isError ? (
        <Alert color="red" title="認証状態を確認できませんでした" variant="light">
          {authSession.error instanceof Error
            ? authSession.error.message
            : '時間を置いて再試行してください。'}
        </Alert>
      ) : authSession.data ? (
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between" wrap="wrap">
              <div>
                <Text fw={700}>ログイン済みです</Text>
                <Text c="dimmed" mt={4} size="sm">
                  {authSession.data.displayName} ({authSession.data.email})
                </Text>
              </div>
              <Group>
                <Button
                  leftSection={<IconTicket size={16} />}
                  onClick={() => {
                    void navigate({ to: '/tickets', search: TICKETS_SEARCH_DEFAULT });
                  }}
                >
                  チケットを見る
                </Button>
                <Button
                  color="gray"
                  leftSection={<IconLock size={16} />}
                  loading={logout.isPending}
                  variant="light"
                  onClick={() => {
                    logout.mutate();
                  }}
                >
                  ログアウト
                </Button>
              </Group>
            </Group>
          </Stack>
        </Card>
      ) : (
        <Card withBorder p="lg" radius="md" shadow="sm">
          <form
            onSubmit={handleSubmit((values) => {
              login.mutate(values, {
                onSuccess: () => {
                  reset();
                  void navigate({ to: '/' });
                },
              });
            })}
          >
            <Stack gap="md">
              <Text fw={600}>ログイン</Text>
              <TextInput
                autoComplete="username"
                error={errors.email?.message}
                label="メールアドレス"
                placeholder="admin@example.com"
                {...register('email')}
              />
              <PasswordInput
                autoComplete="current-password"
                error={errors.password?.message}
                label="パスワード"
                placeholder="••••••••"
                {...register('password')}
              />
              {login.isError ? (
                <Alert color="red" title="ログインに失敗しました" variant="light">
                  {login.error instanceof Error
                    ? login.error.message
                    : '入力内容を確認して再試行してください。'}
                </Alert>
              ) : null}
              <Group justify="space-between" wrap="wrap">
                <Text c="dimmed" size="sm">
                  バックエンドでブートストラップした認証情報を入力してください。
                </Text>
                <Button
                  leftSection={<IconArrowRight size={16} />}
                  loading={login.isPending}
                  type="submit"
                >
                  ログイン
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      )}

      <Card withBorder p="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Text fw={600}>現在の導線</Text>
          <Text c="dimmed" size="sm">
            トップページは公開されており、チケット画面へ進むにはログインが必要です。
          </Text>
          <Group>
            <Button
              leftSection={<IconTicket size={16} />}
              onClick={() => {
                void navigate({ to: '/tickets', search: TICKETS_SEARCH_DEFAULT });
              }}
              variant="light"
            >
              チケット画面へ進む
            </Button>
          </Group>
        </Stack>
      </Card>

      <Alert color="teal" title="Status" variant="light">
        認証されていない状態で protected route に移動するとトップページへ戻ります。
      </Alert>
    </Stack>
  );
}
