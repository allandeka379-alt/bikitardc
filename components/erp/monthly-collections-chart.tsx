'use client';

// Monthly collections vs target — the headline
// chart on the ERP dashboard. Area + line combo.

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import type { MonthlyCollection } from '@/mocks/fixtures/erp-kpis';

export function MonthlyCollectionsChart({ data }: { data: MonthlyCollection[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="collGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={CHART_TOKENS.primary} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART_TOKENS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: CHART_TOKENS.axisLine }}
            tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyCompact(v as number)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_TOKENS.cursor, strokeWidth: 1 }} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', color: CHART_TOKENS.tooltipMuted }}
          />
          <Area
            type="monotone"
            name="Collected"
            dataKey="collected"
            stroke={CHART_TOKENS.primary}
            strokeWidth={2}
            fill="url(#collGradient)"
            animationDuration={650}
          />
          <Line
            type="monotone"
            name="Target"
            dataKey="target"
            stroke={CHART_TOKENS.accent}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 2.5, fill: CHART_TOKENS.accent }}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: CHART_TOKENS.tooltipBg,
        border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
        boxShadow: CHART_TOKENS.tooltipShadow,
        borderRadius: 8,
        padding: '10px 12px',
        minWidth: 160,
      }}
    >
      <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 12,
            padding: '2px 0',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: CHART_TOKENS.tooltipMuted }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrencyCompact(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
