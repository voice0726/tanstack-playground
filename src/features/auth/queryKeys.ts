export const authQueryKey = {
  all: ['auth'] as const,
  session: () => [...authQueryKey.all, 'session'] as const,
};
