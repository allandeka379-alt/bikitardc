'use client';

// ─────────────────────────────────────────────
// Reusable chart primitives for the CEO area.
// Thin wrappers around Recharts with the civic
// palette baked in so every chart on the CEO
// dashboard looks consistent.
// ─────────────────────────────────────────────

import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CATEGORICAL_PALETTE, CHART_TOKENS } from '@/lib/charts/tokens';
import { cn } from '@/lib/cn';

// ─── Chart shell ──────────────────────────────

interface ShellProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
  height?: number;
}

export function ChartShell({ title, subtitle, right, className, children, height = 260 }: ShellProps) {
  return (
    <div className={cn('rounded-lg border border-line bg-card p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-body font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-micro text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Styled Tooltip content ───────────────────

function TipContent({ active, payload, label, valueFormatter }: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
  label?: string | number;
  valueFormatter?: (v: number | string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: CHART_TOKENS.tooltipBg,
        border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: CHART_TOKENS.tooltipShadow,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {label !== undefined && (
        <div style={{ fontSize: 11, color: CHART_TOKENS.tooltipMuted, marginBottom: 4 }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: CHART_TOKENS.tooltipText }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: p.color ?? CHART_TOKENS.primary }} />
          <span style={{ color: CHART_TOKENS.tooltipMuted }}>{p.name ?? p.dataKey}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
            {typeof p.value === 'number' && valueFormatter ? valueFormatter(p.value) : String(p.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Line: a time-series with 1..n series ─────

export function LineTimeSeries({ data, series, valueFormatter }: {
  data: Record<string, number | string>[];
  series: { key: string; label: string; color?: string }[];
  valueFormatter?: (v: number | string) => string;
}) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_TOKENS.grid} vertical={false} />
      <XAxis dataKey="x" tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} />
      <YAxis tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : String(v))} />
      <Tooltip content={<TipContent valueFormatter={valueFormatter} />} cursor={{ fill: CHART_TOKENS.cursor }} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
      {series.map((s, i) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.label}
          stroke={s.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]}
          strokeWidth={2}
          dot={{ r: 2, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      ))}
    </LineChart>
  );
}

// ─── Stacked/grouped bars ─────────────────────

export function GroupedBars({ data, bars, stacked, valueFormatter }: {
  data: Record<string, number | string>[];
  bars: { key: string; label: string; color?: string }[];
  stacked?: boolean;
  valueFormatter?: (v: number | string) => string;
}) {
  return (
    <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_TOKENS.grid} vertical={false} />
      <XAxis dataKey="x" tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} />
      <YAxis tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : String(v))} />
      <Tooltip content={<TipContent valueFormatter={valueFormatter} />} cursor={{ fill: CHART_TOKENS.cursor }} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
      {bars.map((b, i) => (
        <Bar
          key={b.key}
          dataKey={b.key}
          name={b.label}
          stackId={stacked ? 'a' : undefined}
          fill={b.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]}
          radius={stacked ? 0 : [4, 4, 0, 0]}
          maxBarSize={36}
        />
      ))}
    </BarChart>
  );
}

// ─── Single-value horizontal bar list ─────────

export function HorizontalBars({ data, valueFormatter, maxBars }: {
  data: { label: string; value: number; color?: string }[];
  valueFormatter?: (v: number) => string;
  maxBars?: number;
}) {
  const top = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars ?? data.length);
  const max = Math.max(...top.map((d) => d.value), 1);
  return (
    <ul className="flex flex-col gap-2.5">
      {top.map((d, i) => {
        const pct = (d.value / max) * 100;
        const color = d.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length];
        return (
          <li key={d.label} className="grid grid-cols-[140px_1fr_auto] items-center gap-3 text-small">
            <div className="truncate-line text-ink">{d.label}</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="text-right font-semibold tabular-nums text-ink">
              {valueFormatter ? valueFormatter(d.value) : d.value.toLocaleString()}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Area chart (1 series) ────────────────────

export function AreaTimeSeries({ data, dataKey, color, valueFormatter }: {
  data: Record<string, number | string>[];
  dataKey: string;
  color?: string;
  valueFormatter?: (v: number | string) => string;
}) {
  const c = color ?? CHART_TOKENS.primary;
  return (
    <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`area-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={c} stopOpacity={0.25} />
          <stop offset="100%" stopColor={c} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_TOKENS.grid} vertical={false} />
      <XAxis dataKey="x" tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} />
      <YAxis tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : String(v))} />
      <Tooltip content={<TipContent valueFormatter={valueFormatter} />} cursor={{ stroke: CHART_TOKENS.cursor }} />
      <Area type="monotone" dataKey={dataKey} stroke={c} strokeWidth={2} fill={`url(#area-${dataKey})`} />
    </AreaChart>
  );
}

// ─── Donut ────────────────────────────────────

export function Donut({ data, valueFormatter }: {
  data: { name: string; value: number; color?: string }[];
  valueFormatter?: (v: number | string) => string;
}) {
  return (
    <PieChart>
      <Tooltip content={<TipContent valueFormatter={valueFormatter} />} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
      <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
        {data.map((d, i) => (
          <Cell key={i} fill={d.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]} stroke="#fff" />
        ))}
      </Pie>
    </PieChart>
  );
}

// ─── Radial gauge ─────────────────────────────

export function RadialGauge({ data }: {
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <RadialBarChart innerRadius="40%" outerRadius="95%" data={data} startAngle={90} endAngle={-270} barGap={2}>
      <RadialBar background dataKey="value" cornerRadius={6} />
      <Tooltip content={<TipContent valueFormatter={(v) => `${v}%`} />} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
    </RadialBarChart>
  );
}
