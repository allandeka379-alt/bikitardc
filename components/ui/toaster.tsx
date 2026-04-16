'use client';

import { Toast, ToastProvider, ToastViewport } from './toast';
import { useToastStore } from './use-toast';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <ToastProvider swipeDirection="right" duration={5000}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          tone={t.tone}
          title={t.title}
          description={t.description}
          open={t.open}
          onOpenChange={(open) => {
            if (!open) remove(t.id);
          }}
        />
      ))}
      <ToastViewport className="fixed top-4 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none" />
    </ToastProvider>
  );
}
