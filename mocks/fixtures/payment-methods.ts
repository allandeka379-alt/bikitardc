// ─────────────────────────────────────────────
// Payment method catalog — spec §3.1 "Payments".
//
// We render these as cards on the payment picker.
// `demoStatus` mirrors the spec's Demo—Full /
// Demo—Visual distinction so reviewers know what
// is interactive versus static.
// Diaspora methods carry an FX preview (see
// `isDiaspora`) which the payment page renders
// before charging.
// ─────────────────────────────────────────────

import type { PaymentChannel } from './transactions';

export type DemoStatus = 'full' | 'visual';

export interface PaymentMethod {
  channel: PaymentChannel;
  label: string;
  tagline: string;
  /** Local mobile money operator logo hue used as a subtle badge colour. */
  tint: 'red' | 'green' | 'gold' | 'blue' | 'slate' | 'navy';
  /** Brand logo asset served from /public/payments/ — takes priority over the tint badge. */
  logoUrl?: string;
  demoStatus: DemoStatus;
  needsPhone: boolean;
  /** Diaspora rails render the FX preview card. */
  isDiaspora?: boolean;
  /** Currency the payer tops up from — used for FX preview. */
  sourceCurrency?: 'GBP' | 'USD' | 'ZAR' | 'EUR';
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { channel: 'ecocash',    label: 'EcoCash',            tagline: 'Pay from your EcoCash wallet.',          tint: 'red',   logoUrl: '/payments/ecocash.png',   demoStatus: 'full',   needsPhone: true },
  { channel: 'onemoney',   label: 'OneMoney',           tagline: 'Pay from your OneMoney wallet.',         tint: 'green', logoUrl: '/payments/onemoney.png',  demoStatus: 'full',   needsPhone: true },
  { channel: 'innbucks',   label: 'InnBucks',           tagline: 'Pay from your InnBucks wallet.',         tint: 'gold',                                       demoStatus: 'full',   needsPhone: true },
  { channel: 'paynow',     label: 'Paynow',             tagline: 'Card or ZIPIT via Paynow checkout.',     tint: 'navy',  logoUrl: '/payments/paynow.webp',   demoStatus: 'full',   needsPhone: false },
  { channel: 'zimswitch',  label: 'ZimSwitch card',     tagline: 'Tap-and-go ZimSwitch debit card.',       tint: 'blue',  logoUrl: '/payments/zimswitch.jpg', demoStatus: 'visual', needsPhone: false },
  { channel: 'bank',       label: 'Bank transfer',      tagline: 'Show bank details + payment reference.', tint: 'slate',                                      demoStatus: 'visual', needsPhone: false },
  { channel: 'mastercard', label: 'Visa / Mastercard',  tagline: 'Pay from a diaspora card. FX preview before charge.', tint: 'navy',  logoUrl: '/payments/mastercard.png', demoStatus: 'visual', needsPhone: false, isDiaspora: true, sourceCurrency: 'GBP' },
  { channel: 'mukuru',     label: 'Mukuru',             tagline: 'Pay via a Mukuru diaspora remittance.',  tint: 'gold',                                       demoStatus: 'visual', needsPhone: false, isDiaspora: true, sourceCurrency: 'ZAR' },
  { channel: 'telecash',   label: 'Telecash',           tagline: 'Pay from your Telecash wallet.',         tint: 'blue',  logoUrl: '/payments/telecash.png',  demoStatus: 'visual', needsPhone: true  },
  { channel: 'visa',       label: 'Visa card',          tagline: 'Pay from any Visa debit or credit card.',tint: 'navy',  logoUrl: '/payments/visa.svg',      demoStatus: 'visual', needsPhone: false, isDiaspora: true, sourceCurrency: 'USD' },
];

/** Demo-only FX rates (USD per 1 unit of source currency). */
export const FX_RATES: Record<'GBP' | 'USD' | 'ZAR' | 'EUR', number> = {
  GBP: 1.27,
  USD: 1.0,
  ZAR: 0.055,
  EUR: 1.09,
};

/** Returns how much source currency is required to send the given USD amount. */
export function sourceForUsd(usd: number, source: 'GBP' | 'USD' | 'ZAR' | 'EUR'): number {
  const rate = FX_RATES[source];
  return usd / rate;
}
