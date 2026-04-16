'use client';

// Horizontal bar of month-to-date revenue by source.

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL_PALETTE, CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import type { RevenueBySource } from '@/mocks/fixtures/erp-kpis';

export function RevenueBySourceChart({ data }: { data: RevenueBySource[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: -16, bottom: 0 }}
          barCategoryGap={12}
        >
          <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="2 6" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => formatCurrencyCompact(v as number)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
          />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_TOKENS.tooltipText, fontSize: 12 }}
            width={130}
          />
          <Tooltip
            cursor={{ fill: CHART_TOKENS.cursor }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0];
              return (
                <div
                  style={{
                    background: CHART_TOKENS.tooltipBg,
                    border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
                    boxShadow: CHART_TOKENS.tooltipShadow,
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <div style={{ color: CHART_TOKENS.tooltipMuted, marginBottom: 2 }}>{row?.payload.label}</div>
                  <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600 }}>
                    {formatCurrencyCompact(Number(row?.value))}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} animationDuration={650}>
            {data.map((_, i) => (
              <Cell key={i} fill={CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]} />
            ))}
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(v: number) => formatCurrencyCompact(v)}
              style={{ fill: CHART_TOKENS.tooltipText, fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
