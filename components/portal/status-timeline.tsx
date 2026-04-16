// ─────────────────────────────────────────────
// Vertical status timeline (spec §5.4 primitive).
// Renders an ordered list of stages with
// completed / current / upcoming treatments.
// ─────────────────────────────────────────────

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TimelineStage {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  note?: string;
}

interface Props {
  stages: TimelineStage[];
  /** Index of the current (active) stage. Prior stages are shown as completed. */
  currentIndex: number;
  className?: string;
}

export function StatusTimeline({ stages, currentIndex, className }: Props) {
  return (
    <ol className={cn('relative flex flex-col gap-6 pl-6', className)} aria-label="Application progress">
      {stages.map((stage, i) => {
        const completed = i < currentIndex;
        const active = i === currentIndex;

        return (
          <li key={stage.id} className="relative">
            {i < stages.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[-1.1rem] top-7 h-[calc(100%+1rem)] w-px',
                  completed ? 'bg-brand-primary/60' : 'bg-line',
                )}
              />
            )}

            <span
              aria-hidden
              className={cn(
                'absolute left-[-1.6rem] top-0.5 grid h-6 w-6 place-items-center rounded-full border',
                completed && 'border-brand-primary bg-brand-primary text-white',
                active && 'border-brand-primary bg-white text-brand-primary shadow-ring-brand',
                !completed && !active && 'border-line bg-card text-muted',
              )}
            >
              {completed ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </span>

            <div
              className={cn(
                'rounded-md border px-4 py-3 transition-shadow',
                active ? 'border-brand-primary/30 bg-brand-primary/5 shadow-card-sm' : 'border-line bg-card',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-body font-semibold text-ink">{stage.label}</div>
                {stage.timestamp && (
                  <time className="text-micro text-muted">{stage.timestamp}</time>
                )}
              </div>
              {stage.description && (
                <p className="mt-0.5 text-small text-muted">{stage.description}</p>
              )}
              {stage.note && (
                <p className="mt-2 rounded-sm bg-white px-3 py-2 text-small text-ink">
                  {stage.note}
                </p>
              )}
              {active && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2 py-0.5 text-micro font-medium text-brand-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  Current stage
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
