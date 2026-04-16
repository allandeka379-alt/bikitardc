'use client';

// System health monitoring (spec §3.2 Phase 2).
// Grafana-style status dashboard with fabricated
// but realistic metrics. Updates every 3s so the
// charts feel alive.

import {
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

type HealthStatus = 'healthy' | 'degraded' | 'down';

interface Service {
  id: string;
  name: string;
  Icon: LucideIcon;
  status: HealthStatus;
  uptimePct: number;
  latencyMs: number;
  sublabel: string;
}

const INITIAL_SERVICES: Service[] = [
  { id: 'web',      name: 'Web front-end',         Icon: Zap,        status: 'healthy',  uptimePct: 99.982, latencyMs:  92, sublabel: 'Vercel edge' },
  { id: 'api',      name: 'API gateway',           Icon: Server,     status: 'healthy',  uptimePct: 99.941, latencyMs: 128, sublabel: '6 pods · autoscale' },
  { id: 'db',       name: 'Primary database',      Icon: Database,   status: 'healthy',  uptimePct: 99.994, latencyMs:  18, sublabel: 'Postgres 15 · ZA-north' },
  { id: 'cache',    name: 'Redis cache',           Icon: Activity,   status: 'healthy',  uptimePct: 99.999, latencyMs:   2, sublabel: 'Single-AZ' },
  { id: 'ecocash',  name: 'EcoCash gateway',       Icon: Network,    status: 'degraded', uptimePct: 98.420, latencyMs: 420, sublabel: 'Elevated error rate since 07:14' },
  { id: 'sms',      name: 'SMS provider',          Icon: Network,    status: 'healthy',  uptimePct: 99.210, latencyMs: 245, sublabel: 'BulkSMS · queue 3 msgs' },
  { id: 'whatsapp', name: 'WhatsApp Business API', Icon: Network,    status: 'healthy',  uptimePct: 99.410, latencyMs: 310, sublabel: 'Primary tenant' },
  { id: 'disk',     name: 'Object storage',        Icon: HardDrive,  status: 'healthy',  uptimePct: 99.998, latencyMs:  40, sublabel: '78 TB used / 250 TB' },
];

const TONE: Record<HealthStatus, { bg: string; text: string; label: string }> = {
  healthy:  { bg: 'bg-success/10',  text: 'text-success',  label: 'Healthy' },
  degraded: { bg: 'bg-warning/10',  text: 'text-warning',  label: 'Degraded' },
  down:     { bg: 'bg-danger/10',   text: 'text-danger',   label: 'Down' },
};

export default function SystemHealthPage() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());
  const [latencyHistory, setLatencyHistory] = useState<{ x: number; y: number }[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({ x: i, y: 110 + Math.random() * 40 })),
  );
  const [cpuHistory, setCpuHistory] = useState<{ x: number; y: number }[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({ x: i, y: 28 + Math.random() * 14 })),
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.max(1, Math.round(s.latencyMs + (Math.random() * 20 - 10))),
        })),
      );
      setLatencyHistory((prev) => {
        const next = [...prev.slice(1), { x: (prev[prev.length - 1]?.x ?? 0) + 1, y: 100 + Math.random() * 60 }];
        return next;
      });
      setCpuHistory((prev) => {
        const next = [...prev.slice(1), { x: (prev[prev.length - 1]?.x ?? 0) + 1, y: 22 + Math.random() * 30 }];
        return next;
      });
      setLastRefreshed(new Date().toISOString());
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const healthy = services.filter((s) => s.status === 'healthy').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const down = services.filter((s) => s.status === 'down').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">System health</h1>
            <p className="mt-1 text-small text-muted">
              Live posture of the platform services. Metrics refresh every 3 seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">{healthy} healthy</Badge>
            {degraded > 0 && <Badge tone="warning">{degraded} degraded</Badge>}
            {down > 0 && <Badge tone="danger">{down} down</Badge>}
          </div>
        </div>
      </ScrollReveal>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LiveTile
          title="Avg API latency"
          value={`${Math.round(latencyHistory[latencyHistory.length - 1]?.y ?? 0)} ms`}
          delta="p50 ≈ 120 ms"
          data={latencyHistory}
          color={CHART_TOKENS.primary}
        />
        <LiveTile
          title="CPU utilisation"
          value={`${Math.round(cpuHistory[cpuHistory.length - 1]?.y ?? 0)}%`}
          delta="Comfortable headroom"
          data={cpuHistory}
          color={CHART_TOKENS.success}
        />
        <StaticTile Icon={Cpu} title="Error rate" value="0.2%" delta="Within target <1%" tint="success" />
        <StaticTile Icon={ShieldCheck} title="Incidents (7d)" value="1" delta="Mupani connectivity — resolved" tint="brand" />
      </div>

      <ScrollReveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold text-ink">Services</h2>
            <div className="inline-flex items-center gap-2 text-micro text-muted">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Auto-refresh · updated {formatRelative(lastRefreshed)}
            </div>
          </div>
          <ul className="divide-y divide-line">
            {services.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3 text-small">
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-md', TONE[s.status].bg, TONE[s.status].text)}>
                  <s.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-small font-semibold text-ink">{s.name}</span>
                    <Badge
                      tone={
                        s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'danger'
                      }
                      dot
                    >
                      {TONE[s.status].label}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-micro text-muted">{s.sublabel}</div>
                </div>
                <div className="hidden text-right text-micro sm:block">
                  <div className="font-semibold tabular-nums text-ink">{s.uptimePct.toFixed(3)}%</div>
                  <div className="text-muted">uptime · 30d</div>
                </div>
                <div className="text-right text-micro">
                  <div className="font-semibold tabular-nums text-ink">{s.latencyMs} ms</div>
                  <div className="text-muted">p50 latency</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </ScrollReveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-h3 text-ink">Incident playbook</h3>
            <Button variant="secondary" size="sm">
              Open runbook
            </Button>
          </div>
          <ol className="space-y-2 text-small">
            {[
              'Page primary on-call engineer (PagerDuty)',
              'Acknowledge within 5 minutes; notify CEO for severity 1',
              'Post status update to status.bikita.gov.zw every 30 minutes',
              'Hand off at end of shift with summary in #incident channel',
              'Publish post-mortem within 5 working days',
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-micro font-semibold text-brand-primary">
                  {i + 1}
                </span>
                <span className="text-ink">{t}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-h3 text-ink">Open issues</h3>
          </div>
          <ul className="space-y-2 text-small">
            <li className="rounded-md border border-warning/20 bg-warning/5 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">EcoCash webhook retries</span>
                <Badge tone="warning">Investigating</Badge>
              </div>
              <p className="mt-1 text-micro text-muted">
                Elevated 5xx since 07:14 — reconciliation engine auto-retries every 90s.
              </p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function LiveTile({
  title,
  value,
  delta,
  data,
  color,
}: {
  title: string;
  value: string;
  delta: string;
  data: { x: number; y: number }[];
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-micro text-muted">{title}</div>
      <div className="text-h3 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{delta}</div>
      <div className="mt-2 h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`sparkly-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={() => null} />
            <Area
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={2}
              fill={`url(#sparkly-${title})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StaticTile({
  Icon,
  title,
  value,
  delta,
  tint,
}: {
  Icon: LucideIcon;
  title: string;
  value: string;
  delta: string;
  tint: 'brand' | 'success';
}) {
  return (
    <Card className="flex items-start gap-3 p-5">
      <span
        className={cn(
          'grid h-10 w-10 place-items-center rounded-md',
          tint === 'brand' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-success/10 text-success',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-micro text-muted">{title}</div>
        <div className="text-h3 font-bold tabular-nums text-ink">{value}</div>
        <div className="text-micro text-muted">{delta}</div>
      </div>
    </Card>
  );
}
