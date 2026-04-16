import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { AlertBanner } from '@/components/ui/alert-banner';
import { DemoBanner } from '@/components/ui/demo-banner';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Bikita RDC — Unified Digital Services',
    template: '%s · Bikita RDC',
  },
  description:
    'Pay rates, apply for permits, report issues and track your bills — the Bikita Rural District Council digital services portal.',
  applicationName: 'Bikita RDC',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
  },
  openGraph: {
    title: 'Bikita RDC — Unified Digital Services',
    description: 'Pay rates, apply, report — from your phone, in English or Shona.',
    siteName: 'Bikita RDC',
    type: 'website',
  },
  robots: {
    // Demo is gated at the hosting layer per spec §10.2; keep indexers off.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1F3A68',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-dvh bg-surface font-sans text-ink antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <DemoBanner />
            <AlertBanner />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
