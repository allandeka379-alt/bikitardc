'use client';

// Workflow designer + interest-rules admin (spec
// §3.2). Click a workflow to expand, drag stages
// with up/down controls (keyboard-friendly),
// edit approver role + SLA inline.

import {
  ArrowDown,
  ArrowUp,
  GitBranch,
  Plus,
  Save,
  Shield,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { formatRelative } from '@/lib/format';
import { useWorkflowsStore } from '@/lib/stores/workflows';
import { cn } from '@/lib/cn';

const ROLES = ['Clerk', 'Revenue Officer', 'Works Supervisor', 'Administrator'] as const;

export default function WorkflowsAdminPage() {
  const workflows = useWorkflowsStore((s) => s.workflows);
  const interest = useWorkflowsStore((s) => s.interest);
  const reorder = useWorkflowsStore((s) => s.reorder);
  const updateStage = useWorkflowsStore((s) => s.updateStage);
  const addStage = useWorkflowsStore((s) => s.addStage);
  const removeStage = useWorkflowsStore((s) => s.removeStage);
  const setInterest = useWorkflowsStore((s) => s.setInterest);
  const reset = useWorkflowsStore((s) => s.reset);

  const [active, setActive] = useState<string>(workflows[0]?.id ?? '');

  const current = workflows.find((w) => w.id === active);
  const totalSla = current?.stages.reduce((s, st) => s + st.slaHours, 0) ?? 0;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Workflows & rules</h1>
            <p className="mt-1 text-small text-muted">
              Configure the stages, approvers and SLAs for each application type, and the interest
              policy that governs overdue balances.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              reset();
              toast({ title: 'Reset to defaults', tone: 'info' });
            }}
          >
            Reset to defaults
          </Button>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-5 py-3 text-small font-semibold text-ink">
            <GitBranch className="mr-2 inline h-4 w-4 text-muted" />
            Workflows
          </div>
          <ul className="flex flex-col">
            {workflows.map((w) => {
              const act = active === w.id;
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => setActive(w.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 border-b border-line px-5 py-3 text-left transition-colors last:border-b-0',
                      act ? 'bg-brand-primary/5 text-brand-primary' : 'text-ink hover:bg-surface/60',
                    )}
                  >
                    <div>
                      <div className="text-small font-semibold">{w.name}</div>
                      <div className="text-micro text-muted">
                        {w.stages.length} stages · updated {formatRelative(w.updatedAt)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          {current && (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div>
                  <div className="text-small font-semibold text-ink">{current.name} workflow</div>
                  <div className="text-micro text-muted">
                    Total SLA: <span className="font-semibold tabular-nums text-ink">{totalSla}h</span> · {current.stages.length} stages
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    addStage(current.id);
                    toast({ title: 'Stage added', tone: 'info' });
                  }}
                  leadingIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add stage
                </Button>
              </div>
              <ol className="divide-y divide-line">
                {current.stages.map((st, i) => (
                  <li key={st.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-micro font-semibold text-brand-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 grid gap-2 sm:grid-cols-[1.4fr_1fr_120px_auto]">
                      <Input
                        value={st.label}
                        onChange={(e) => updateStage(current.id, st.id, { label: e.target.value })}
                        placeholder="Stage name"
                      />
                      <select
                        value={st.approverRole}
                        onChange={(e) =>
                          updateStage(current.id, st.id, { approverRole: e.target.value as (typeof ROLES)[number] })
                        }
                        className="block w-full rounded-sm border border-line bg-card px-3 py-2 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          max={720}
                          value={st.slaHours}
                          onChange={(e) => updateStage(current.id, st.id, { slaHours: Number(e.target.value) })}
                          className="text-right"
                        />
                        <span className="text-micro text-muted">h</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reorder(current.id, i, Math.max(0, i - 1))}
                          disabled={i === 0}
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reorder(current.id, i, Math.min(current.stages.length - 1, i + 1))}
                          disabled={i === current.stages.length - 1}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeStage(current.id, st.id);
                            toast({ title: 'Stage removed', tone: 'info' });
                          }}
                          disabled={current.stages.length <= 2}
                          aria-label="Remove stage"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="border-t border-line bg-surface/40 px-5 py-3 text-micro text-muted">
                Changes auto-save. Existing applications already in a removed stage are grandfathered
                until completion.
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted" />
                <h2 className="text-small font-semibold text-ink">Interest & penalty rules</h2>
              </div>
              <Badge tone="neutral">In force from {interest.effectiveFrom}</Badge>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div>
                <Label htmlFor="int-rate">Monthly rate (%)</Label>
                <Input
                  id="int-rate"
                  type="number"
                  min={0}
                  step={0.1}
                  value={interest.monthlyRatePct}
                  onChange={(e) => setInterest({ monthlyRatePct: Number(e.target.value) })}
                />
                <p className="mt-1 text-micro text-muted">Compound monthly on overdue balance.</p>
              </div>
              <div>
                <Label htmlFor="int-grace">Grace period (days)</Label>
                <Input
                  id="int-grace"
                  type="number"
                  min={0}
                  max={60}
                  value={interest.graceDays}
                  onChange={(e) => setInterest({ graceDays: Number(e.target.value) })}
                />
                <p className="mt-1 text-micro text-muted">Interest starts after this many days past due.</p>
              </div>
              <div>
                <Label htmlFor="int-cap">Cap on interest (% of principal)</Label>
                <Input
                  id="int-cap"
                  type="number"
                  min={0}
                  max={100}
                  value={interest.capPct}
                  onChange={(e) => setInterest({ capPct: Number(e.target.value) })}
                />
                <p className="mt-1 text-micro text-muted">Interest never exceeds this fraction.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 border-t border-line bg-surface/40 px-5 py-3 text-small text-brand-primary">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Interest rule changes are gazetted and a 30-day notice period is required before they
                apply to existing arrears.
              </p>
            </div>
            <div className="flex justify-end border-t border-line bg-surface/20 px-5 py-3">
              <Button size="sm" variant="secondary" leadingIcon={<Save className="h-3.5 w-3.5" />}>
                Save (auto-saved)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
