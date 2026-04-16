'use client';

// Append-only audit log drawer — slides in from the
// right. Accessible from every ERP screen via the
// top-bar "History" button.

import * as Dialog from '@radix-ui/react-dialog';
import { History, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useErpStore } from '@/lib/stores/erp';
import { formatDate, formatRelative } from '@/lib/format';
import { AUDIT_ACTION_LABEL } from '@/mocks/fixtures/audit-log';

export function AuditDrawer() {
  const [open, setOpen] = useState(false);
  const audit = useErpStore((s) => s.audit);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" leadingIcon={<History className="h-4 w-4" />}>
          Audit
          {audit.length > 0 && (
            <span className="ml-1 rounded-full bg-brand-primary/10 px-1.5 text-[10px] font-bold text-brand-primary">
              {audit.length}
            </span>
          )}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[60] flex h-dvh w-full max-w-[440px] flex-col bg-card shadow-card-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-right-6">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="text-h3 text-ink">Audit log</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-micro text-muted">
                Every sensitive action performed in the ERP.
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <ol className="flex-1 overflow-y-auto">
            {audit.map((entry) => (
              <li
                key={entry.id}
                className="group relative border-b border-line px-5 py-3 last:border-b-0 hover:bg-surface/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={toneForAction(entry.action)}>
                        {AUDIT_ACTION_LABEL[entry.action]}
                      </Badge>
                      <span className="text-micro text-muted">{entry.actorRole}</span>
                    </div>
                    <div className="mt-1 truncate-line text-small font-medium text-ink">
                      {entry.actorName}
                    </div>
                    <div className="mt-0.5 text-small text-muted">{entry.subject}</div>
                    {entry.note && (
                      <div className="mt-1 text-micro text-muted">{entry.note}</div>
                    )}
                  </div>
                  <time
                    dateTime={entry.at}
                    title={formatDate(entry.at, 'en', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    className="shrink-0 text-micro text-muted"
                  >
                    {formatRelative(entry.at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-line px-5 py-3 text-micro text-muted">
            Append-only feed · retained indefinitely · DEMO
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function toneForAction(
  action: string,
): 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (action.includes('approved') || action.includes('resolved') || action.includes('matched')) return 'success';
  if (action.includes('rejected')) return 'danger';
  if (action.includes('assigned') || action.includes('advanced') || action.includes('created')) return 'info';
  if (action === 'role-changed') return 'warning';
  return 'neutral';
}
