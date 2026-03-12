import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import type { ComponentPropsWithoutRef } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { TicketActorInfo } from '#/features/tickets/components/detail/TicketActorInfo.tsx';
import type { TicketCommentFormInput } from '#/features/tickets/schema/form.ts';
import type { TicketComment } from '#/features/tickets/schema/index.ts';
import { formatDateTime } from '#/shared/utils/date.ts';
import { TicketCommentForm } from './TicketCommentForm.tsx';

type FormOnSubmit = NonNullable<ComponentPropsWithoutRef<'form'>['onSubmit']>;

type TicketCommentItemProps = {
  comment: TicketComment;
  isOwner: boolean;
  isEditing: boolean;
  canEdit: boolean;
  canStartEditing: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  editBodyError?: string;
  editBodyField: UseFormRegister<TicketCommentFormInput>;
  onStartEditing: () => void;
  onDelete: () => void;
  onCancelEditing: () => void;
  onSubmitEdit: FormOnSubmit;
};

export function TicketCommentItem({
  comment,
  isOwner,
  isEditing,
  canEdit,
  canStartEditing,
  canDelete,
  isDeleting,
  isUpdating,
  editBodyError,
  editBodyField,
  onStartEditing,
  onDelete,
  onCancelEditing,
  onSubmitEdit,
}: TicketCommentItemProps) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Group align="flex-start" flex="1" justify="space-between">
            <TicketActorInfo actor={comment.createdBy} fallback="不明なユーザー" />
            <Text c="dimmed" size="sm">
              {formatDateTime(comment.createdAt)}
            </Text>
          </Group>
          {isOwner ? (
            <Group gap="xs">
              <Button
                aria-label={`コメント ${comment.id} を編集`}
                color="gray"
                disabled={!canEdit}
                leftSection={<IconPencil size={14} />}
                size="xs"
                variant="subtle"
                onClick={() => {
                  if (!canStartEditing) {
                    return;
                  }

                  onStartEditing();
                }}
              >
                編集
              </Button>
              <Button
                aria-label={`コメント ${comment.id} を削除`}
                color="red"
                disabled={!canDelete}
                leftSection={<IconTrash size={14} />}
                loading={isDeleting}
                size="xs"
                variant="subtle"
                onClick={onDelete}
              >
                削除
              </Button>
            </Group>
          ) : null}
        </Group>
        {isEditing ? (
          <TicketCommentForm
            bodyError={editBodyError}
            bodyField={editBodyField('body')}
            cancelButton={
              <Button
                color="gray"
                leftSection={<IconX size={16} />}
                type="button"
                variant="light"
                onClick={onCancelEditing}
              >
                キャンセル
              </Button>
            }
            isSubmitting={isUpdating}
            label="コメントを編集"
            submitIcon={<IconCheck size={16} />}
            submitLabel="更新する"
            onSubmit={onSubmitEdit}
          />
        ) : (
          <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.body}</Text>
        )}
      </Stack>
    </Paper>
  );
}
