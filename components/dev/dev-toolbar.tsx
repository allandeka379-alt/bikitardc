'use client';

// ─────────────────────────────────────────────
// Dev toolbar — spec §10.3.
//
// Toggled with Ctrl+Shift+D (or Cmd+Shift+D on
// Mac). Lets a reviewer demonstrate states without
// waiting for real time to pass:
//   • Force next payment outcome (succeed / fail / timeout)
//   • Advance latest submitted application one stage
//   • Toggle simulated offline mode
//   • Reset all runtime demo state
//
// Hidden by default. Panel floats bottom-right.
// ─────────────────────────────────────────────

import {
  Check,
  CircleOff,
  FastForward,
  FlaskConical,
  Rewind,
  RotateCcw,
  ShieldCheck,
  Target,
  TimerOff,
  TimerReset,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useApplicationStore } from '@/lib/stores/application';
import { useAuthStore } from '@/lib/stores/auth';
import { useDemoStore } from '@/lib/stores/demo';
import { useErpStore } from '@/lib/stores/erp';
import { usePaymentStore } from '@/lib/stores/payment';
import {
  STAGE_ORDER,
  type ApplicationStage,
} from '@/mocks/fixtures/applications';
import { cn } from '@/lib/cn';

export function DevToolbar() {
  const [open, setOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  const forceOutcome = usePaymentStore((s) => s.forceOutcome);
  const setForceOutcome = usePaymentStore((s) => s.setForceOutcome);

  const resetDemo = useDemoStore((s) => s.reset);
  const resetApps = useApplicationStore((s) => s.reset);
  const resetErp = useErpStore((s) => s.reset);
  const clearPayment = usePaymentStore((s) => s.clear);
  const setApplicationStage = useErpStore((s) => s.setApplicationStage);

  const { userId, fullName } = useCurrentUser();
  const runtimeApps = useApplicationStore((s) => s.runtimeApps);
  const stageOverrides = useErpStore((s) => s.applicationStage);

  // Keyboard toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle =
        (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd');
      if (isToggle) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Visual offline indicator — sets a body class other code can read.
  useEffect(() => {
    if (offline) document.body.dataset.demoOffline = '1';
    else delete document.body.dataset.demoOffline;
  }, [offline]);

  const latestOwnApp = userId
    ? runtimeApps.find((a) => a.ownerId === userId) ??
      null
    : null;
  const effectiveStage = latestOwnApp
    ? (stageOverrides[latestOwnApp.id] ?? latestOwnApp.stage)
    : null;
  const nextStage: ApplicationStage | null = (() => {
    if (!effectiveStage) return null;
    const idx = STAGE_ORDER.indexOf(effectiveStage);
    if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1] ?? null;
  })();

  const advanceApp = () => {
    if (!latestOwnApp || !nextStage) return;
    setApplicationStage(latestOwnApp.id, nextStage, fullName ?? 'Demo Reviewer');
    toast({
      title: `Advanced ${latestOwnApp.reference}`,
      description: `Stage → ${nextStage.replace('-', ' ')}`,
      tone: 'info',
    });
  };

  const rewindApp = () => {
    if (!latestOwnApp || !effectiveStage) return;
    const idx = STAGE_ORDER.indexOf(effectiveStage);
    if (idx <= 0) return;
    const prev = STAGE_ORDER[idx - 1]!;
    setApplicationStage(latestOwnApp.id, prev, fullName ?? 'Demo Reviewer');
    toast({
      title: `Rewound ${latestOwnApp.reference}`,
      description: `Stage → ${prev.replace('-', ' ')}`,
      tone: 'info',
    });
  };

  const resetAll = () => {
    resetDemo();
    resetApps();
    resetErp();
    clearPayment();
    setOffline(false);
    setForceOutcome(null);
    toast({ title: 'Demo state reset to seed.', tone: 'success' });
  };

  const signOut = useAuthStore((s) => s.logout);
  const resetFactorySettings = () => {
    resetAll();
    signOut();
    // Give the toast a moment then hard-reload so stores re-hydrate empty.
    setTimeout(() => {
      if (typeof window !== 'undefined') window.location.href = '/';
    }, 400);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Demo toolbar"
      className="fixed bottom-4 right-4 z-[70] w-[320px] overflow-hidden rounded-lg border border-ink/10 bg-card shadow-card-lg animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line bg-brand-ink px-4 py-2.5 text-white">
        <div className="inline-flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-brand-accent" />
          <div className="text-small font-semibold">Demo toolbar</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-7 w-7 place-items-center rounded-sm text-white/80 transition-colors hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-4 py-3 text-small">
        {/* Force outcome */}
        <Section icon={Target} label="Force next payment">
          <div className="grid grid-cols-3 gap-1.5">
            {(['succeeded', 'failed', 'timeout'] as const).map((o) => {
              const active = forceOutcome === o;
              const Icon = o === 'succeeded' ? Check : o === 'failed' ? X : TimerOff;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setForceOutcome(active ? null : o)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-micro font-medium transition-colors',
                    active
                      ? o === 'succeeded'
                        ? 'border-success bg-success/10 text-success'
                        : o === 'failed'
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-warning bg-warning/10 text-warning'
                      : 'border-line bg-card text-ink hover:border-brand-primary/30',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {o}
                </button>
              );
            })}
          </div>
          {forceOutcome && (
            <p className="mt-1.5 text-[11px] text-muted">
              Next payment will resolve as <span className="font-semibold text-ink">{forceOutcome}</span>. One-shot.
            </p>
          )}
        </Section>

        {/* Application advance */}
        <Section icon={FastForward} label="Advance your latest application">
          {latestOwnApp ? (
            <>
              <div className="mb-2 truncate-line text-[11px] text-muted">
                <span className="font-mono text-ink">{latestOwnApp.reference}</span> · current{' '}
                <span className="font-semibold text-ink">
                  {effectiveStage?.replace('-', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={rewindApp}
                  disabled={!effectiveStage || STAGE_ORDER.indexOf(effectiveStage) <= 0}
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-line bg-card px-2 py-1.5 text-micro font-medium text-ink hover:border-brand-primary/30 disabled:opacity-50"
                >
                  <Rewind className="h-3 w-3" />
                  Rewind
                </button>
                <button
                  type="button"
                  onClick={advanceApp}
                  disabled={!nextStage}
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-brand-primary/30 bg-brand-primary/5 px-2 py-1.5 text-micro font-medium text-brand-primary hover:bg-brand-primary/10 disabled:opacity-50"
                >
                  <FastForward className="h-3 w-3" />
                  {nextStage ? `→ ${nextStage.replace('-', ' ')}` : 'Finished'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-muted">
              No runtime applications yet. Submit one from <span className="font-mono text-ink">/portal/apply/business-licence</span>.
            </p>
          )}
        </Section>

        {/* Offline */}
        <Section icon={WifiOff} label="Simulated connectivity">
          <button
            type="button"
            onClick={() => {
              setOffline((v) => !v);
              toast({
                title: offline ? 'Online again.' : 'Offline mode enabled.',
                tone: 'info',
              });
            }}
            className={cn(
              'inline-flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-micro font-medium transition-colors',
              offline
                ? 'border-warning bg-warning/10 text-warning'
                : 'border-line bg-card text-ink hover:border-brand-primary/30',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {offline ? <CircleOff className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {offline ? 'Offline' : 'Online'}
            </span>
            <span className="text-[10px] text-muted">click to toggle</span>
          </button>
        </Section>

        {/* Reset */}
        <Section icon={TimerReset} label="Reset demo state">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-line bg-card px-2 py-1.5 text-micro font-medium text-ink hover:border-brand-primary/30"
            >
              <RotateCcw className="h-3 w-3" />
              Runtime only
            </button>
            <button
              type="button"
              onClick={resetFactorySettings}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-danger/30 bg-danger/5 px-2 py-1.5 text-micro font-medium text-danger hover:bg-danger/10"
            >
              <X className="h-3 w-3" />
              Sign-out + reset
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-muted">
            Runtime-only keeps you signed in; sign-out+reset sends you back to the landing page.
          </p>
        </Section>
      </div>

      {/* Footer */}
      <div className="border-t border-line bg-surface/60 px-4 py-2 text-[10px] text-muted">
        Ctrl+Shift+D to toggle · Esc to close
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 last:mb-0">
      <div className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {children}
    </section>
  );
}
