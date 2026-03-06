import { Button, Group, Modal, Stack, Text } from '@mantine/core';

type TicketDeleteModalProps = {
  opened: boolean;
  ticket: {
    id: number;
    title: string;
  } | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TicketDeleteModal({
  opened,
  ticket,
  isDeleting,
  onClose,
  onConfirm,
}: TicketDeleteModalProps) {
  return (
    <Modal centered onClose={onClose} opened={opened} title="チケットを削除">
      <Stack gap="lg">
        <Stack gap={4}>
          <Text size="sm">この操作は取り消せません。削除対象を確認してください。</Text>
          {ticket ? (
            <Text fw={600} size="sm">
              #{ticket.id} {ticket.title}
            </Text>
          ) : null}
        </Stack>
        <Group justify="flex-end">
          <Button onClick={onClose} variant="default">
            キャンセル
          </Button>
          <Button color="red" loading={isDeleting} onClick={onConfirm}>
            削除する
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
