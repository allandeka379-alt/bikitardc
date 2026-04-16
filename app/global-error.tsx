'use client';

// Root-level error boundary — rendered when the
// root layout itself fails. Must include its own
// <html> and <body> because the parent layout is
// not present at this level.

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[BikitaRDC] Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F7F8FA', color: '#222' }}>
        <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '24px' }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <div
              style={{
                margin: '0 auto 20px',
                display: 'grid',
                placeItems: 'center',
                width: 64,
                height: 64,
                borderRadius: 999,
                background: 'rgba(180, 35, 24, 0.1)',
                color: '#B42318',
              }}
            >
              <AlertTriangle width={28} height={28} />
            </div>
            <h1 style={{ fontSize: 28, lineHeight: '36px', margin: 0, color: '#222' }}>
              Something went wrong.
            </h1>
            <p style={{ margin: '8px 0 24px', color: '#555' }}>
              We've logged the error. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#1F3A68',
                color: '#fff',
                border: 0,
                padding: '12px 20px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <RotateCw width={16} height={16} /> Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
