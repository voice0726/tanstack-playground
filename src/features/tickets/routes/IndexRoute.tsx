import { Paper, Stack } from '@mantine/core';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import { TicketDeleteModal } from '@/features/tickets/components/dialogs/TicketDeleteModal.tsx';
import { TicketsListPanel } from '@/features/tickets/components/list/TicketsListPanel.tsx';
import { TicketsSearchForm } from '@/features/tickets/components/list/TicketsSearchForm.tsx';
import { useDeleteTicket } from '@/features/tickets/hooks/useDeleteTicket.ts';
import { useTickets } from '@/features/tickets/hooks/useTickets.ts';
import type { Ticket } from '@/features/tickets/schema/index.ts';
import {
  type TicketsSearch,
  type TicketsSearchFormInput,
  type TicketsSearchFormOutput,
  ticketsSearchSchema,
} from '@/features/tickets/schema/search.ts';
import { getErrorMessage } from '@/features/tickets/utils/getErrorMessage.ts';
import { showToast } from '@/shared/ui/toast.tsx';

const pageSizeOptions = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

export function IndexRoute() {
  const search = useSearch({ from: '/_authenticated/tickets/' });
  const navigate = useNavigate();
  const deleteTicket = useDeleteTicket();
  const [deleteTarget, setDeleteTarget] = useState<Pick<Ticket, 'id' | 'title'> | null>(null);

  const normalizedSearch = ticketsSearchSchema.parse(search);
  const updateSearch = (patch: Partial<TicketsSearch>) =>
    ticketsSearchSchema.parse({ ...normalizedSearch, ...patch });

  const searchFormValues = useMemo(
    () =>
      ({
        q: normalizedSearch.q ?? '',
        status: normalizedSearch.status,
        sortBy: normalizedSearch.sortBy,
        sortOrder: normalizedSearch.sortOrder,
      }) satisfies TicketsSearchFormInput,
    [
      normalizedSearch.q,
      normalizedSearch.sortBy,
      normalizedSearch.sortOrder,
      normalizedSearch.status,
    ],
  );

  const { data, isError, isFetching, isPending, isPlaceholderData } = useTickets({
    filters: normalizedSearch,
  });
  const isTableLoading = isPending;
  const isTableFetching = isFetching && !isPending;
  const hasTableError = isError && (!data || isPlaceholderData);
  const items = hasTableError ? [] : (data?.items ?? []);
  const computedTotal = data?.total ?? 0;
  const computedTotalPages = Math.max(1, Math.ceil(computedTotal / normalizedSearch.pageSize));
  const lastListMetaRef = useRef({
    total: computedTotal,
    totalPages: computedTotalPages,
  });
  if (!hasTableError) {
    lastListMetaRef.current = {
      total: computedTotal,
      totalPages: computedTotalPages,
    };
  }
  const total = hasTableError ? lastListMetaRef.current.total : computedTotal;
  const totalPages = hasTableError ? lastListMetaRef.current.totalPages : computedTotalPages;
  const from =
    total === 0 ? 0 : Math.min((normalizedSearch.page - 1) * normalizedSearch.pageSize + 1, total);
  const to = Math.min(total, normalizedSearch.page * normalizedSearch.pageSize);
  const rangeLabel = hasTableError && total > 0 ? `- / ${total}` : `${from}-${to} / ${total}`;

  const navigateToTicketDetail = (ticketId: number) => {
    void navigate({
      to: '/tickets/$ticketId',
      params: { ticketId: String(ticketId) },
      search: normalizedSearch,
    });
  };

  const navigateToTicketEdit = (ticketId: number) => {
    void navigate({
      to: '/tickets/$ticketId/edit',
      params: { ticketId: String(ticketId) },
      search: normalizedSearch,
    });
  };

  const navigateToTicketCreate = () => {
    void navigate({ to: '/tickets/new', search: normalizedSearch });
  };

  const submitSearchForm = (values: TicketsSearchFormOutput) => {
    void navigate({
      to: '/tickets',
      search: updateSearch({ ...values, page: 1 }),
    });
  };

  const changePage = (page: number) => {
    void navigate({ to: '/tickets', search: updateSearch({ page }) });
  };

  const changePageSize = (pageSize: number) => {
    void navigate({
      to: '/tickets',
      search: updateSearch({ page: 1, pageSize }),
    });
  };

  const openDeleteModal = (ticket: Pick<Ticket, 'id' | 'title'>) => {
    setDeleteTarget(ticket);
  };

  const closeDeleteModal = () => {
    if (deleteTicket.isPending) {
      return;
    }

    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    const ticket = deleteTarget;

    deleteTicket.mutate(ticket.id, {
      onError: (error) => {
        showToast({
          title: '削除に失敗しました',
          message: getErrorMessage(error, '再試行してください'),
          color: 'red',
        });
      },
      onSuccess: () => {
        showToast({
          title: 'チケットを削除しました',
          message: `#${ticket.id} ${ticket.title}`,
        });
        setDeleteTarget(null);
      },
    });
  };

  return (
    <Stack gap="lg">
      <Paper p="lg" shadow="sm">
        <TicketsSearchForm initialValues={searchFormValues} onSubmit={submitSearchForm} />
      </Paper>

      <TicketsListPanel
        hasError={hasTableError}
        isFetching={isTableFetching}
        isLoading={isTableLoading}
        items={items}
        pageSizeOptions={pageSizeOptions}
        rangeLabel={rangeLabel}
        search={normalizedSearch}
        total={total}
        totalPages={totalPages}
        onCreate={navigateToTicketCreate}
        onDelete={openDeleteModal}
        onEdit={navigateToTicketEdit}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        onView={navigateToTicketDetail}
      />

      <TicketDeleteModal
        isDeleting={deleteTicket.isPending}
        opened={deleteTarget !== null}
        ticket={deleteTarget}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
