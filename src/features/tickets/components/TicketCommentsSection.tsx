import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconCheck,
  IconMessageCircle,
  IconPencil,
  IconSend,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TicketActorValue } from '#/features/tickets/components/TicketActorValue.tsx';
import { TicketCommentDeleteModal } from '#/features/tickets/components/TicketCommentDeleteModal.tsx';
import { TicketCommentForm } from '#/features/tickets/components/TicketCommentForm.tsx';
import { useCreateTicketComment } from '#/features/tickets/hooks/useCreateTicketComment.ts';
import { useDeleteTicketComment } from '#/features/tickets/hooks/useDeleteTicketComment.ts';
import { useUpdateTicketComment } from '#/features/tickets/hooks/useUpdateTicketComment.ts';
import {
  TICKET_COMMENT_FORM_DEFAULT_VALUES,
  type TicketCommentFormInput,
  type TicketCommentFormOutput,
  ticketCommentFormValuesSchema,
} from '#/features/tickets/schema/form.ts';
import type { TicketComment, TicketComments } from '#/features/tickets/schema/index.ts';
import { useToast } from '#/shared/ui/toast.tsx';
import { formatDateTime } from '#/shared/utils/date.ts';

type TicketCommentsSectionProps = {
  ticketId: number;
  ticketTitle: string;
  comments: TicketComments;
  currentUserId?: number;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function TicketCommentsSection({
  ticketId,
  ticketTitle,
  comments,
  currentUserId,
}: TicketCommentsSectionProps) {
  const { showToast } = useToast();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<TicketComment | null>(null);

  // Form state for creating a new comment from the section header form.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCommentFormInput, unknown, TicketCommentFormOutput>({
    defaultValues: TICKET_COMMENT_FORM_DEFAULT_VALUES,
    resolver: zodResolver(ticketCommentFormValuesSchema),
  });
  // Separate form state for inline editing of an existing comment.
  const {
    register: registerEditComment,
    handleSubmit: handleEditCommentSubmit,
    reset: resetEditComment,
    formState: { errors: editErrors },
  } = useForm<TicketCommentFormInput, unknown, TicketCommentFormOutput>({
    defaultValues: TICKET_COMMENT_FORM_DEFAULT_VALUES,
    resolver: zodResolver(ticketCommentFormValuesSchema),
  });

  const createTicketComment = useCreateTicketComment();
  const updateTicketComment = useUpdateTicketComment();
  const deleteTicketComment = useDeleteTicketComment();

  const isDeleteModalBusy = commentToDelete !== null && deleteTicketComment.isPending;
  const isEditingComment = (commentId: number) => editingCommentId === commentId;

  const submittingDeleteCommentId = deleteTicketComment.isPending
    ? deleteTicketComment.variables?.commentId
    : undefined;
  const submittingUpdateCommentId = updateTicketComment.isPending
    ? updateTicketComment.variables?.commentId
    : undefined;

  const isSubmittingDelete = (commentId: number) => submittingDeleteCommentId === commentId;
  const isSubmittingUpdate = (commentId: number) => submittingUpdateCommentId === commentId;

  const isCommentOwner = (comment: TicketComment) =>
    currentUserId != null &&
    comment.createdBy?.id != null &&
    comment.createdBy.id === currentUserId;

  const canEditComment = (comment: TicketComment) =>
    isCommentOwner(comment) && !isSubmittingDelete(comment.id) && !isEditingComment(comment.id);
  const canDeleteComment = (comment: TicketComment) =>
    isCommentOwner(comment) && !isSubmittingUpdate(comment.id);

  const submitComment = handleSubmit((values) => {
    createTicketComment.mutate(
      {
        ticketId,
        body: values.body,
      },
      {
        onSuccess: () => {
          reset(TICKET_COMMENT_FORM_DEFAULT_VALUES);
          showToast({
            title: 'コメントを投稿しました',
            message: `#${ticketId} ${ticketTitle}`,
          });
        },
      },
    );
  });

  const submitUpdatedComment = handleEditCommentSubmit((values) => {
    if (editingCommentId === null) {
      return;
    }

    updateTicketComment.mutate(
      {
        ticketId,
        commentId: editingCommentId,
        body: values.body,
      },
      {
        onError: (error) => {
          showToast({
            title: 'コメントの更新に失敗しました',
            message: getErrorMessage(error, '再試行してください'),
            color: 'red',
          });
        },
        onSuccess: () => {
          setEditingCommentId(null);
          resetEditComment(TICKET_COMMENT_FORM_DEFAULT_VALUES);
          showToast({
            title: 'コメントを更新しました',
            message: `#${ticketId} ${ticketTitle}`,
          });
        },
      },
    );
  });

  return (
    <Stack gap="md">
      <TicketCommentDeleteModal
        comment={commentToDelete ? { id: commentToDelete.id, body: commentToDelete.body } : null}
        isDeleting={isDeleteModalBusy}
        opened={commentToDelete !== null}
        onClose={() => {
          if (isDeleteModalBusy) {
            return;
          }

          setCommentToDelete(null);
        }}
        onConfirm={() => {
          if (!commentToDelete) {
            return;
          }

          deleteTicketComment.mutate(
            {
              ticketId,
              commentId: commentToDelete.id,
            },
            {
              onError: (error) => {
                showToast({
                  title: 'コメントの削除に失敗しました',
                  message: getErrorMessage(error, '再試行してください'),
                  color: 'red',
                });
              },
              onSuccess: () => {
                showToast({
                  title: 'コメントを削除しました',
                  message: `#${ticketId} ${ticketTitle}`,
                });
                if (editingCommentId === commentToDelete.id) {
                  setEditingCommentId(null);
                  resetEditComment(TICKET_COMMENT_FORM_DEFAULT_VALUES);
                }
                setCommentToDelete(null);
              },
            },
          );
        }}
      />

      <Group gap="xs">
        <ThemeIcon color="grape" radius="xl" size="sm" variant="light">
          <IconMessageCircle size={14} />
        </ThemeIcon>
        <Text fw={700}>コメント</Text>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <TicketCommentForm
          bodyError={errors.body?.message}
          bodyField={register('body')}
          errorMessage={
            createTicketComment.isError
              ? getErrorMessage(createTicketComment.error, '再試行してください')
              : undefined
          }
          errorTitle="コメントを投稿できませんでした"
          isSubmitting={createTicketComment.isPending}
          label="コメントを追加"
          placeholder="調査状況や対応内容を共有できます"
          submitIcon={<IconSend size={16} />}
          submitLabel="投稿する"
          onSubmit={submitComment}
        />
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
                  <Group align="flex-start" flex="1" justify="space-between">
                    <TicketActorValue actor={comment.createdBy} fallback="不明なユーザー" />
                    <Text c="dimmed" size="sm">
                      {formatDateTime(comment.createdAt)}
                    </Text>
                  </Group>
                  {isCommentOwner(comment) ? (
                    <Group gap="xs">
                      <Button
                        aria-label={`コメント ${comment.id} を編集`}
                        color="gray"
                        disabled={!canEditComment(comment)}
                        leftSection={<IconPencil size={14} />}
                        size="xs"
                        variant="subtle"
                        onClick={() => {
                          if (!canEditComment(comment)) {
                            return;
                          }

                          setEditingCommentId(comment.id);
                          resetEditComment({ body: comment.body });
                        }}
                      >
                        編集
                      </Button>
                      <Button
                        aria-label={`コメント ${comment.id} を削除`}
                        color="red"
                        disabled={!canDeleteComment(comment)}
                        leftSection={<IconTrash size={14} />}
                        loading={isSubmittingDelete(comment.id)}
                        size="xs"
                        variant="subtle"
                        onClick={() => {
                          setCommentToDelete(comment);
                        }}
                      >
                        削除
                      </Button>
                    </Group>
                  ) : null}
                </Group>
                {isEditingComment(comment.id) ? (
                  <TicketCommentForm
                    bodyError={editErrors.body?.message}
                    bodyField={registerEditComment('body')}
                    cancelButton={
                      <Button
                        color="gray"
                        leftSection={<IconX size={16} />}
                        type="button"
                        variant="light"
                        onClick={() => {
                          setEditingCommentId(null);
                          resetEditComment(TICKET_COMMENT_FORM_DEFAULT_VALUES);
                        }}
                      >
                        キャンセル
                      </Button>
                    }
                    isSubmitting={isSubmittingUpdate(comment.id)}
                    label="コメントを編集"
                    submitIcon={<IconCheck size={16} />}
                    submitLabel="更新する"
                    onSubmit={submitUpdatedComment}
                  />
                ) : (
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</Text>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
