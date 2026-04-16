'use client';

// Downloads the certificate PDF. Mirrors the
// receipt download pattern — dynamic-imports the
// heavy PDF library + generates the QR on click.

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import type { Application } from '@/mocks/fixtures/applications';

interface Props {
  application: Application;
  issuedTo: string;
  origin?: string;
  className?: string;
}

export function CertificateDownloadButton({ application, issuedTo, origin, className }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    try {
      setBusy(true);
      const [{ pdf }, { CertificatePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./certificate-pdf'),
      ]);

      const verifyUrl = `${origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://bikita.demo')}/verify/${application.reference}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 440,
        color: { dark: '#1F3A68', light: '#FFFFFF' },
      });

      const blob = await pdf(
        <CertificatePdf application={application} issuedTo={issuedTo} qrDataUrl={qrDataUrl} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bikita-certificate-${application.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[certificate] download failed:', err);
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
      className={className}
    >
      Download certificate
    </Button>
  );
}
