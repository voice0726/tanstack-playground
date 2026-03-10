import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Group, Paper, Stack, Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconMessageCircle, IconSend } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { TicketActorValue } from '#/features/tickets/components/TicketActorValue.tsx';
import {
  TICKET_COMMENT_FORM_DEFAULT_VALUES,
  type TicketCommentFormInput,
  type TicketCommentFormOutput,
  ticketCommentFormValuesSchema,
} from '#/features/tickets/schema/form.ts';
import type { TicketComments } from '#/features/tickets/schema/index.ts';
import { formatDateTime } from '#/shared/utils/date.ts';

type TicketCommentsSectionProps = {
  comments: TicketComments;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: TicketCommentFormOutput) => Promise<void>;
};

export function TicketCommentsSection({
  comments,
  isSubmitting,
  errorMessage,
  onSubmit,
}: TicketCommentsSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCommentFormInput, unknown, TicketCommentFormOutput>({
    defaultValues: TICKET_COMMENT_FORM_DEFAULT_VALUES,
    resolver: zodResolver(ticketCommentFormValuesSchema),
  });

  const submitComment = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(TICKET_COMMENT_FORM_DEFAULT_VALUES);
    } catch {
      // Error state is surfaced by the parent through errorMessage/toast.
    }
  });

  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon color="grape" radius="xl" size="sm" variant="light">
          <IconMessageCircle size={14} />
        </ThemeIcon>
        <Text fw={700}>コメント</Text>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <form onSubmit={submitComment}>
          <Stack gap="md">
            {errorMessage ? (
              <Alert color="red" title="コメントを投稿できませんでした" variant="light">
                {errorMessage}
              </Alert>
            ) : null}

            <Textarea
              autosize
              label="コメントを追加"
              minRows={3}
              placeholder="調査状況や対応内容を共有できます"
              {...register('body')}
              error={errors.body?.message}
            />

            <Group justify="flex-end">
              <Button leftSection={<IconSend size={16} />} loading={isSubmitting} type="submit">
                投稿する
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {comments.items.length === 0 ? (
        <Paper p="md" radius="md" withBorder>
          <Text c="dimmed" size="sm">
            まだコメントはありません。
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {comments.items.map((comment) => (
            <Paper key={comment.id} p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Group align="flex-start" justify="space-between" wrap="wrap">
                  <TicketActorValue actor={comment.createdBy} fallback="不明なユーザー" />
                  <Text c="dimmed" size="sm">
                    {formatDateTime(comment.createdAt)}
                  </Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
