export const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const parseTicketId = (ticketIdParam: string) => {
  const ticketId = Number(ticketIdParam);

  return Number.isInteger(ticketId) && ticketId > 0 ? ticketId : null;
};
