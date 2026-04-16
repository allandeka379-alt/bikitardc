'use client';

// Share-to-WhatsApp button. On platforms that
// support the Web Share API (most mobile + modern
// desktop Safari) we use the native sheet; otherwise
// fall back to a wa.me deep-link.

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import type { Transaction } from '@/mocks/fixtures/transactions';

export function ShareReceiptButton({ transaction }: { transaction: Transaction }) {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://bikita.demo'}/verify/${transaction.reference}`;
  const text = `Bikita RDC receipt ${transaction.reference} — ${transaction.currency} ${transaction.amount.toFixed(2)}. Verify: ${shareUrl}`;

  const run = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Bikita RDC receipt ${transaction.reference}`,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // user-cancelled — no-op
        return;
      }
    }
    // Fallback: WhatsApp web
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
    toast({ title: 'Opening WhatsApp share…', tone: 'info' });
  };

  return (
    <Button variant="secondary" size="lg" onClick={run} leadingIcon={<Share2 className="h-4 w-4" />}>
      Share to WhatsApp
    </Button>
  );
}
