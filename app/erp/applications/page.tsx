'use client';

// ─────────────────────────────────────────────
// Applications kanban — spec §3.2 + §6.2 screen #15.
// Five columns, drag between them to advance.
// Persists per-card stage to the ERP store and
// appends an audit entry on each move.
// ─────────────────────────────────────────────

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, GripVertical, User2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useAllApplications } from '@/lib/stores/application';
import { useErpStore } from '@/lib/stores/erp';
import { formatRelative } from '@/lib/format';
import {
  APPLICATION_TYPE_LABEL,
  STAGE_ORDER,
  type Application,
  type ApplicationStage,
} from '@/mocks/fixtures/applications';
import { cn } from '@/lib/cn';

const COLUMN_TITLE: Record<ApplicationStage, string> = {
  submitted:              'Submitted',
  'under-review':          'Under review',
  'inspection-scheduled':  'Inspection scheduled',
  approved:               'Approved',
  rejected:               'Rejected',
  issued:                 'Issued',
};

const COLUMN_ACCENT: Record<ApplicationStage, string> = {
  submitted:              'border-t-brand-primary',
  'under-review':         'border-t-info',
  'inspection-scheduled': 'border-t-brand-accent',
  approved:               'border-t-success',
  rejected:               'border-t-danger',
  issued:                 'border-t-success',
};

export default function ApplicationsKanbanPage() {
  const setStage = useErpStore((s) => s.setApplicationStage);
  const all = useAllApplications();
  const { fullName } = useCurrentUser();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // `all` already applies stage overrides via useAllApplications()
  const stageOf = (a: Application): ApplicationStage => a.stage;

  const columns = useMemo(() => {
    const map: Record<ApplicationStage, Application[]> = {
      submitted: [], 'under-review': [], 'inspection-scheduled': [], approved: [], rejected: [], issued: [],
    };
    for (const a of all) {
      map[stageOf(a)].push(a);
    }
    return map;
  }, [all]);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const appId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    const newStage = overId as ApplicationStage;
    const app = all.find((a) => a.id === appId);
    if (!app) return;
    if (stageOf(app) === newStage) return;

    setStage(app.id, newStage, fullName ?? 'Rates Clerk');
    toast({
      title: 'Stage updated',
      description: `${app.reference} → ${COLUMN_TITLE[newStage]}`,
      tone: 'success',
    });
  };

  const activeApp = activeId ? all.find((a) => a.id === activeId) : null;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Applications</h1>
            <p className="mt-1 text-small text-muted">
              Drag cards between columns to advance the workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">
              {all.length} total
            </Badge>
            <Badge tone="warning">
              {columns['under-review'].length + columns['inspection-scheduled'].length} in progress
            </Badge>
          </div>
        </div>
      </ScrollReveal>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <Column key={stage} stage={stage} apps={columns[stage]} isDragging={!!activeId} />
          ))}
          <Column key="rejected" stage="rejected" apps={columns.rejected} isDragging={!!activeId} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeApp ? <ApplicationCard app={activeApp} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({
  stage,
  apps,
  isDragging,
}: {
  stage: ApplicationStage;
  apps: Application[];
  isDragging: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-[300px] shrink-0 flex-col rounded-lg border-t-[3px] border border-line bg-card transition-colors',
        COLUMN_ACCENT[stage],
        isOver && 'ring-2 ring-brand-primary/30 bg-brand-primary/3',
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <div className="text-small font-semibold text-ink">{COLUMN_TITLE[stage]}</div>
          <div className="text-micro text-muted">{apps.length} in this stage</div>
        </div>
        <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-surface px-1.5 text-micro font-semibold tabular-nums text-ink">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {apps.length === 0 && !isDragging && (
          <div className="mt-4 rounded-md border border-dashed border-line px-3 py-6 text-center text-micro text-muted">
            Drop cards here
          </div>
        )}
        {apps.map((a) => (
          <DraggableApplicationCard key={a.id} app={a} />
        ))}
      </div>
    </div>
  );
}

function DraggableApplicationCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <ApplicationCard app={app} />
    </div>
  );
}

function ApplicationCard({ app, dragging = false }: { app: Application; dragging?: boolean }) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden p-3 transition-[box-shadow,transform] duration-base ease-out-expo',
        dragging && 'rotate-[1.5deg] shadow-card-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-muted" aria-hidden>
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase text-muted">
              {app.reference}
            </span>
            {app.feePaid ? (
              <Badge tone="success">Fee paid</Badge>
            ) : (
              <Badge tone="warning">Fee pending</Badge>
            )}
          </div>
          <h4 className="mt-1 text-small font-semibold leading-tight text-ink">{app.title}</h4>
          <p className="mt-0.5 text-micro text-muted">
            {APPLICATION_TYPE_LABEL[app.type]}
          </p>
        </div>

        {/* Open-detail link — stops pointer event so it doesn't trigger a drag. */}
        {!dragging && (
          <Link
            href={`/erp/applications/${app.reference}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-sm text-muted hover:bg-surface hover:text-brand-primary"
            aria-label={`Open ${app.reference}`}
            title="Open detail"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5 text-micro text-muted">
        <span className="inline-flex items-center gap-1">
          <User2 className="h-3 w-3" />
          {app.ownerId.replace('u_', '').slice(0, 12)}
        </span>
        <time title={app.submittedAt}>{formatRelative(app.submittedAt)}</time>
      </div>
    </Card>
  );
}

