export const parseTicketId = (ticketIdParam: string) => {
  if (!/^\d+$/.test(ticketIdParam)) {
    return null;
  }

  const ticketId = Number(ticketIdParam);

  return ticketId > 0 ? ticketId : null;
};
