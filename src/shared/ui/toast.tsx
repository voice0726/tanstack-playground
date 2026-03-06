import { Box, Notification, Portal, Stack, Text } from '@mantine/core';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

type ToastColor = 'teal' | 'red';

type ToastItem = {
  id: number;
  title: string;
  message?: string;
  color: ToastColor;
};

type ShowToastInput = {
  title: string;
  message?: string;
  color?: ToastColor;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
};

const TOAST_DURATION_MS = 4_000;

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastView({
  id,
  title,
  message,
  color,
  onClose,
}: ToastItem & { onClose: (id: number) => void }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose(id);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [id, onClose]);

  return (
    <Notification color={color} onClose={() => onClose(id)} title={title} withCloseButton>
      {message ? <Text size="sm">{message}</Text> : null}
    </Notification>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (input: ShowToastInput) => {
    const id = Date.now() + Math.random();

    setToasts((current) => [
      ...current,
      {
        id,
        title: input.title,
        message: input.message,
        color: input.color ?? 'teal',
      },
    ]);
  };

  const closeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        <Box
          style={{
            position: 'fixed',
            top: 88,
            right: 16,
            zIndex: 400,
            width: 'min(360px, calc(100vw - 32px))',
          }}
        >
          <Stack gap="sm">
            {toasts.map((toast) => (
              <ToastView key={toast.id} {...toast} onClose={closeToast} />
            ))}
          </Stack>
        </Box>
      </Portal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
