'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { DevToolbar } from '@/components/dev/dev-toolbar';
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
      <DevToolbar />
      <ServiceWorkerRegistrar />
    </QueryClientProvider>
  );
}
