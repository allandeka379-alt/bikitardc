// ─────────────────────────────────────────────
// Bikita chart design tokens
//
// Mirrors the Synvas CHART_TOKENS pattern but
// re-themed for the light civic palette:
//   • Primary = Council Blue #1F3A68
//   • Accent  = Gold         #C9A227
//   • Semantic greens / ambers / reds
//
// Values use HEX or rgba so they can be passed
// directly to Recharts fills/strokes without
// needing a CSS-variable bridge.
// ─────────────────────────────────────────────

export const CHART_TOKENS = {
  grid:      'rgba(31, 58, 104, 0.08)',
  axisLabel: 'rgba(85, 85, 85, 0.70)',
  axisLine:  'rgba(31, 58, 104, 0.14)',
  cursor:    'rgba(31, 58, 104, 0.08)',

  primary:   '#1F3A68',
  primarySoft: 'rgba(31, 58, 104, 0.12)',
  accent:    '#C9A227',
  accentSoft: 'rgba(201, 162, 39, 0.14)',

  success:   '#1E7F4F',
  warning:   '#C77700',
  danger:    '#B42318',
  sky:       '#0369A1',
  violet:    '#7C3AED',
  mint:      '#22C55E',

  tooltipBg: 'rgba(255, 255, 255, 0.98)',
  tooltipBorder: 'rgba(31, 58, 104, 0.12)',
  tooltipText:  '#222222',
  tooltipMuted: '#555555',
  tooltipShadow: '0 16px 32px -12px rgba(17, 24, 39, 0.18)',
} as const;

/** Qualitative palette for categorical splits (wards, service types). */
export const CATEGORICAL_PALETTE = [
  CHART_TOKENS.primary,
  CHART_TOKENS.accent,
  CHART_TOKENS.success,
  CHART_TOKENS.sky,
  CHART_TOKENS.violet,
  CHART_TOKENS.warning,
] as const;
