'use client';

// Wraps the receipt PDF generation in a button.
// Dynamic-import @react-pdf/renderer so the ~400KB
// library only loads when a reviewer actually
// downloads — doesn't bloat the first-paint bundle.

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import type { Property } from '@/mocks/fixtures/properties';
import type { Transaction } from '@/mocks/fixtures/transactions';

interface Props {
  transaction: Transaction;
  property: Property;
  ownerName: string;
  /** Origin used to build the verification URL baked into the QR. */
  origin?: string;
}

export function DownloadReceiptButton({ transaction, property, ownerName, origin }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    try {
      setBusy(true);

      // Dynamically import so @react-pdf only loads on demand.
      const [{ pdf }, { ReceiptPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./receipt-pdf'),
      ]);

      const verifyUrl = `${origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://bikita.demo')}/verify/${transaction.reference}`;

      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 440,
        color: { dark: '#1F3A68', light: '#FFFFFF' },
      });

      const blob = await pdf(
        <ReceiptPdf
          transaction={transaction}
          property={property}
          ownerName={ownerName}
          qrDataUrl={qrDataUrl}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bikita-receipt-${transaction.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[receipt] download failed:', err);
      toast({ title: 'Download failed. Please try again.', tone: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={run}
      loading={busy}
      leadingIcon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    >
      Download receipt
    </Button>
  );
}
