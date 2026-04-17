'use client';

// ─────────────────────────────────────────────
// Reusable chart primitives for the CEO area.
// Thin wrappers around Recharts (with a few
// hand-rolled SVG chart types like Sparkline,
// Bullet, Heatmap, ProgressRing) so every chart
// on the CEO dashboards shares the civic palette
// and feels varied rather than monotonous.
// ─────────────────────────────────────────────

import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  FunnelChart,
  Funnel,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
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
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string; payload?: Record<string, unknown> }[];
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
      {label !== undefined && label !== '' && (
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

// ─── Stacked area (multi-series over time) ────

export function StackedArea({ data, series, valueFormatter }: {
  data: Record<string, number | string>[];
  series: { key: string; label: string; color?: string }[];
  valueFormatter?: (v: number | string) => string;
}) {
  return (
    <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <defs>
        {series.map((s, i) => {
          const c = s.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length];
          return (
            <linearGradient key={s.key} id={`stackedarea-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity={0.6} />
              <stop offset="100%" stopColor={c} stopOpacity={0.05} />
            </linearGradient>
          );
        })}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_TOKENS.grid} vertical={false} />
      <XAxis dataKey="x" tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} />
      <YAxis tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : String(v))} />
      <Tooltip content={<TipContent valueFormatter={valueFormatter} />} cursor={{ stroke: CHART_TOKENS.cursor }} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
      {series.map((s, i) => {
        const c = s.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length];
        return (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId="1"
            stroke={c}
            strokeWidth={1.5}
            fill={`url(#stackedarea-${s.key})`}
          />
        );
      })}
    </AreaChart>
  );
}

// ─── Combo (bars + line on same axis) ─────────

export function ComboChart({ data, bars, lines, valueFormatter }: {
  data: Record<string, number | string>[];
  bars: { key: string; label: string; color?: string; stack?: boolean }[];
  lines: { key: string; label: string; color?: string }[];
  valueFormatter?: (v: number | string) => string;
}) {
  const stacked = bars.some((b) => b.stack);
  return (
    <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          stackId={stacked && b.stack ? 'a' : undefined}
          fill={b.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]}
          maxBarSize={32}
          radius={stacked ? 0 : [4, 4, 0, 0]}
        />
      ))}
      {lines.map((l, i) => (
        <Line
          key={l.key}
          type="monotone"
          dataKey={l.key}
          name={l.label}
          stroke={l.color ?? CATEGORICAL_PALETTE[(i + bars.length) % CATEGORICAL_PALETTE.length]}
          strokeWidth={2.25}
          dot={{ r: 2.5, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      ))}
    </ComposedChart>
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

// ─── Radial "concentric rings" gauge ──────────
//
// Recharts RadialBar renders each row as its own
// ring from inner→outer. With a single `fill`
// style + per-row fill via dataKey the legend
// draws properly; previous version over-filled
// the container so the middle ring disappeared.

export function RadialGauge({ data, valueFormatter }: {
  data: { name: string; value: number; fill: string }[];
  valueFormatter?: (v: number) => string;
}) {
  return (
    <RadialBarChart innerRadius="28%" outerRadius="95%" data={data} startAngle={90} endAngle={-270} barGap={4}>
      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
      <RadialBar background={{ fill: CHART_TOKENS.grid }} dataKey="value" cornerRadius={6} />
      <Tooltip content={<TipContent valueFormatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : `${v}%`)} />} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
    </RadialBarChart>
  );
}

// ─── Semi-circular gauge (single value) ───────

export function ProgressRing({ value, label, sublabel, color }: {
  value: number;          // 0..100
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: 'used', value: clamped }];
  const c = color ?? CHART_TOKENS.primary;
  return (
    <div className="relative grid h-full place-items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: CHART_TOKENS.grid }}
            dataKey="value"
            cornerRadius={8}
            fill={c}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="text-h2 font-bold tabular-nums text-ink">{Math.round(clamped)}%</div>
        {label && <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>}
        {sublabel && <div className="mt-0.5 text-micro text-muted">{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── Radar (multi-dimensional comparison) ─────

export function RadarPlot({ data, series, max }: {
  data: Record<string, number | string>[];
  series: { key: string; label: string; color?: string }[];
  max?: number;
}) {
  return (
    <RadarChart data={data} outerRadius="75%">
      <PolarGrid stroke={CHART_TOKENS.grid} />
      <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} />
      <PolarRadiusAxis angle={90} domain={[0, max ?? 'auto']} tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 10 }} />
      <Tooltip content={<TipContent />} />
      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={7} />
      {series.map((s, i) => {
        const c = s.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length];
        return (
          <Radar
            key={s.key}
            name={s.label}
            dataKey={s.key}
            stroke={c}
            fill={c}
            fillOpacity={0.18}
            strokeWidth={2}
          />
        );
      })}
    </RadarChart>
  );
}

// ─── Scatter plot ─────────────────────────────

export function ScatterPlot({ data, xLabel, yLabel, zLabel, xFormatter, yFormatter, color }: {
  data: { x: number; y: number; z?: number; label?: string }[];
  xLabel: string;
  yLabel: string;
  zLabel?: string;
  xFormatter?: (v: number) => string;
  yFormatter?: (v: number) => string;
  color?: string;
}) {
  const c = color ?? CHART_TOKENS.primary;
  const hasZ = data.some((d) => typeof d.z === 'number');
  return (
    <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_TOKENS.grid} />
      <XAxis type="number" dataKey="x" name={xLabel} tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (xFormatter ? xFormatter(v) : String(v))} label={{ value: xLabel, position: 'insideBottom', offset: -6, style: { fill: CHART_TOKENS.axisLabel, fontSize: 10 } }} />
      <YAxis type="number" dataKey="y" name={yLabel} tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} axisLine={{ stroke: CHART_TOKENS.axisLine }} tickLine={false} tickFormatter={(v) => (yFormatter ? yFormatter(v) : String(v))} />
      {hasZ && <ZAxis type="number" dataKey="z" range={[40, 260]} name={zLabel ?? 'size'} />}
      <Tooltip content={<TipContent />} cursor={{ strokeDasharray: '3 3' }} />
      <Scatter data={data} fill={c} />
    </ScatterChart>
  );
}

// ─── Treemap (hierarchical composition) ───────

export function TreemapPlot({ data, valueFormatter }: {
  data: { name: string; value: number; color?: string }[];
  valueFormatter?: (v: number) => string;
}) {
  const colored = data.map((d, i) => ({
    ...d,
    fill: d.color ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length],
  }));
  return (
    <Treemap
      data={colored}
      dataKey="value"
      nameKey="name"
      stroke="#fff"
      fill={CHART_TOKENS.primary}
      content={<TreemapNode valueFormatter={valueFormatter} />}
    >
      <Tooltip content={<TipContent valueFormatter={valueFormatter ? (v) => (typeof v === 'number' ? valueFormatter(v) : String(v)) : undefined} />} />
    </Treemap>
  );
}

interface TreemapNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  fill?: string;
  valueFormatter?: (v: number) => string;
}

function TreemapNode({ x = 0, y = 0, width = 0, height = 0, name = '', value = 0, fill, valueFormatter }: TreemapNodeProps) {
  const showLabel = width > 60 && height > 26;
  const showValue = width > 80 && height > 44;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: fill ?? CHART_TOKENS.primary, stroke: '#fff', strokeWidth: 2, cursor: 'default' }} />
      {showLabel && (
        <text x={x + 8} y={y + 18} fill="#fff" fontSize={11} fontWeight={600} style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      )}
      {showValue && (
        <text x={x + 8} y={y + 34} fill="rgba(255,255,255,0.82)" fontSize={10} style={{ pointerEvents: 'none' }}>
          {valueFormatter ? valueFormatter(value) : value.toLocaleString()}
        </text>
      )}
    </g>
  );
}

// ─── Funnel (proper funnel shape) ─────────────

export function FunnelPlot({ data, valueFormatter }: {
  data: { name: string; value: number; fill?: string }[];
  valueFormatter?: (v: number) => string;
}) {
  const colored = data.map((d, i) => ({
    ...d,
    fill: d.fill ?? CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length],
  }));
  return (
    <FunnelChart>
      <Tooltip content={<TipContent valueFormatter={valueFormatter ? (v) => (typeof v === 'number' ? valueFormatter(v) : String(v)) : undefined} />} />
      <Funnel dataKey="value" data={colored} isAnimationActive stroke="#fff">
        <LabelList position="right" fill={CHART_TOKENS.tooltipText} stroke="none" dataKey="name" style={{ fontSize: 11, fontWeight: 600 }} />
      </Funnel>
    </FunnelChart>
  );
}

// ─── Sparkline (tiny inline trend) ────────────

export function Sparkline({ data, color, height = 32, width = 96 }: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length === 0) return null;
  const c = color ?? CHART_TOKENS.primary;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`;
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity={0.3} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${id})`} />
      <polyline points={points.join(' ')} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bullet chart (actual vs target + bands) ──

export function Bullet({ label, actual, target, max, tone, valueFormatter }: {
  label?: string;
  actual: number;
  target: number;
  max?: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  valueFormatter?: (v: number) => string;
}) {
  const ceiling = max ?? Math.max(actual, target) * 1.15;
  const actualPct = Math.max(0, Math.min(100, (actual / ceiling) * 100));
  const targetPct = Math.max(0, Math.min(100, (target / ceiling) * 100));
  const actualColor =
    tone === 'success' ? CHART_TOKENS.success :
    tone === 'warning' ? CHART_TOKENS.warning :
    tone === 'danger'  ? CHART_TOKENS.danger  :
                          CHART_TOKENS.primary;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center justify-between text-small">
          <span className="truncate-line text-ink">{label}</span>
          <span className="font-semibold tabular-nums text-ink">
            {valueFormatter ? valueFormatter(actual) : actual.toLocaleString()}
            <span className="ml-1 text-muted">
              / {valueFormatter ? valueFormatter(target) : target.toLocaleString()}
            </span>
          </span>
        </div>
      )}
      <div className="relative h-3 rounded-full bg-line">
        {/* Qualitative band: 0–70% grid, 70–90% lighter, 90–100% lightest */}
        <div className="absolute inset-y-0 left-0 rounded-full bg-line" style={{ width: '100%' }} />
        <div className="absolute inset-y-0 left-0 h-full rounded-full" style={{ width: `${actualPct}%`, background: actualColor }} />
        {/* Target tick */}
        <div
          className="absolute top-[-3px] h-[18px] w-[2px] rounded-full bg-ink"
          style={{ left: `calc(${targetPct}% - 1px)` }}
          aria-label="target"
        />
      </div>
    </div>
  );
}

// ─── Heatmap (grid of buckets) ────────────────

export function Heatmap({ rows, cols, cells, maxValue, valueFormatter, colorScale }: {
  rows: string[];
  cols: string[];
  cells: Record<string, Record<string, number>>;  // cells[row][col] = value
  maxValue?: number;
  valueFormatter?: (v: number) => string;
  colorScale?: [string, string];
}) {
  const [c0, c1] = colorScale ?? ['rgba(31, 58, 104, 0.06)', CHART_TOKENS.primary];
  let max = maxValue ?? 0;
  if (!maxValue) {
    for (const r of rows) for (const co of cols) max = Math.max(max, cells[r]?.[co] ?? 0);
  }
  max = Math.max(1, max);

  return (
    <div className="overflow-auto">
      <table className="border-separate border-spacing-1 text-[10px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-card" />
            {cols.map((c) => (
              <th key={c} className="px-1.5 py-1 text-left font-medium uppercase tracking-wide text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="sticky left-0 bg-card px-1.5 py-1 text-left font-medium text-ink">{r}</th>
              {cols.map((c) => {
                const v = cells[r]?.[c] ?? 0;
                const t = v / max;
                return (
                  <td key={c}>
                    <div
                      title={`${r} · ${c}: ${valueFormatter ? valueFormatter(v) : v}`}
                      className="grid h-8 w-10 place-items-center rounded-[4px] text-[10px] font-semibold tabular-nums"
                      style={{
                        background: interp(c0, c1, t),
                        color: t > 0.55 ? '#fff' : CHART_TOKENS.tooltipText,
                      }}
                    >
                      {v > 0 ? (valueFormatter ? valueFormatter(v) : v) : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Linear interp for rgba/hex-ish color strings. Handles hex, rgb, rgba.
function interp(a: string, b: string, t: number): string {
  const pa = parseColor(a);
  const pb = parseColor(b);
  if (!pa || !pb) return t > 0.5 ? b : a;
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  const al = +(pa.a + (pb.a - pa.a) * t).toFixed(3);
  return `rgba(${r}, ${g}, ${bl}, ${al})`;
}

function parseColor(c: string): { r: number; g: number; b: number; a: number } | null {
  const s = c.trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    const v = hex.length === 3
      ? hex.split('').map((h) => h + h).join('')
      : hex.padEnd(6, '0').slice(0, 6);
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return Number.isFinite(r + g + b) ? { r, g, b, a: 1 } : null;
  }
  const m = s.match(/rgba?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?))?\s*\)/);
  if (m) return { r: +m[1]!, g: +m[2]!, b: +m[3]!, a: m[4] !== undefined ? +m[4]! : 1 };
  return null;
}
