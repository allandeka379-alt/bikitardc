'use client';

// ─────────────────────────────────────────────
// Bank statement import UI (spec §3.2
// "Bank statement import & auto-match" Demo-Visual).
//
// Drag-and-drop CSV → parses client-side (tolerant
// parser for the demo), attempts auto-match against
// TRANSACTIONS by reference + amount, shows a
// preview split into matched / unmatched rows.
// Uploads are not persisted.
// ─────────────────────────────────────────────

import { CheckCircle2, Download, FileSpreadsheet, Link2, TriangleAlert, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { cn } from '@/lib/cn';

interface BankRow {
  date: string;
  amount: number;
  reference: string;
  payer: string;
  /** Filled on auto-match. */
  matchedTxId?: string;
}

const SAMPLE_CSV = `date,amount,reference,payer
2026-04-15,87.50,BRDC-20260114-003412,Tendai Moyo
2026-04-14,108.00,BRDC-20260328-004819,Tendai Moyo
2026-04-12,55.00,BRDC-20260405-005211,Farai Murwisi
2026-04-10,250.00,ZIPIT-ACME-001,Acme Holdings
2026-04-08,18.75,UNKNOWN-999,Anon
`;

function parseCsv(text: string): BankRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  // Skip header if present
  const startIdx = /^date\s*,/i.test(lines[0]!) ? 1 : 0;
  return lines.slice(startIdx).map((line) => {
    const [date, amount, reference, payer] = line.split(',').map((s) => s?.trim() ?? '');
    return {
      date: date ?? '',
      amount: Number(amount ?? 0),
      reference: reference ?? '',
      payer: payer ?? '',
    } as BankRow;
  });
}

function autoMatch(rows: BankRow[]): BankRow[] {
  return rows.map((r) => {
    const hit = TRANSACTIONS.find(
      (t) =>
        t.status === 'succeeded' &&
        t.reference === r.reference &&
        Math.abs(t.amount - r.amount) < 0.01,
    );
    return hit ? { ...r, matchedTxId: hit.id } : r;
  });
}

export default function BankImportPage() {
  const [rows, setRows] = useState<BankRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processText = async (text: string, name: string) => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600)); // fake network
    const parsed = autoMatch(parseCsv(text));
    setRows(parsed);
    setFileName(name);
    setBusy(false);
  };

  const onFile = (file: File) => {
    if (!/\.csv$/i.test(file.name)) {
      return toast({ title: 'Please upload a .csv file.', tone: 'danger' });
    }
    const reader = new FileReader();
    reader.onload = () => processText(String(reader.result ?? ''), file.name);
    reader.readAsText(file);
  };

  const useSample = () => processText(SAMPLE_CSV, 'sample-statement.csv');

  const reset = () => {
    setRows(null);
    setFileName(null);
  };

  const { matched, unmatched } = useMemo(() => {
    const m: BankRow[] = [];
    const u: BankRow[] = [];
    (rows ?? []).forEach((r) => (r.matchedTxId ? m.push(r) : u.push(r)));
    return { matched: m, unmatched: u };
  }, [rows]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Bank statement import</h1>
            <p className="mt-1 text-small text-muted">
              Upload a bank CSV. We'll auto-match rows against internal transactions and surface what
              doesn't line up.
            </p>
          </div>
          <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
            CSV template
          </Button>
        </div>
      </ScrollReveal>

      {!rows ? (
        <Card className="p-8 text-center sm:p-12">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line bg-surface/40 px-5 py-10 transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/3"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Upload className="h-5 w-5" />
            </span>
            <div className="text-body font-semibold text-ink">Drop a CSV or click to upload</div>
            <div className="text-small text-muted">
              Columns: <code className="font-mono text-[10px]">date, amount, reference, payer</code>
            </div>
            {busy && <div className="text-micro text-muted">Parsing…</div>}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </div>
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={useSample} leadingIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}>
              Use the sample statement instead
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <div>
                <div className="text-small font-semibold text-ink">{fileName}</div>
                <div className="text-micro text-muted">{rows.length} rows parsed</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge tone="success">
                <Link2 className="h-3 w-3" />
                {matched.length} auto-matched
              </Badge>
              <Badge tone="warning">
                <TriangleAlert className="h-3 w-3" />
                {unmatched.length} unmatched
              </Badge>
              <Button variant="ghost" size="sm" onClick={reset} leadingIcon={<X className="h-3.5 w-3.5" />}>
                Upload another
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-success/5 px-5 py-3">
                <h3 className="text-small font-semibold text-success">Auto-matched</h3>
                <Badge tone="success">{matched.length}</Badge>
              </div>
              {matched.length === 0 ? (
                <div className="px-5 py-10 text-center text-small text-muted">
                  Nothing auto-matched. Check reference format with the bank.
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {matched.map((r, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 px-5 py-3 text-small">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          <span className="font-mono text-[11px] text-ink">{r.reference}</span>
                        </div>
                        <div className="mt-0.5 truncate-line text-micro text-muted">
                          {r.payer} · {formatDate(r.date)}
                        </div>
                      </div>
                      <span className="text-small font-semibold tabular-nums text-ink">
                        {formatCurrency(r.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-warning/8 px-5 py-3">
                <h3 className="text-small font-semibold text-warning">Unmatched — need review</h3>
                <Badge tone="warning">{unmatched.length}</Badge>
              </div>
              {unmatched.length === 0 ? (
                <div className="px-5 py-10 text-center text-small text-muted">Everything landed. 🎉</div>
              ) : (
                <ul className="divide-y divide-line">
                  {unmatched.map((r, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 px-5 py-3 text-small">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="h-3.5 w-3.5 text-warning" />
                          <span className="font-mono text-[11px] text-ink">{r.reference || '—'}</span>
                        </div>
                        <div className="mt-0.5 truncate-line text-micro text-muted">
                          {r.payer || 'Unknown payer'} · {formatDate(r.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-small font-semibold tabular-nums text-ink">
                          {formatCurrency(r.amount)}
                        </span>
                        <Button variant="secondary" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className={cn('mt-6 flex justify-end gap-2')}>
            <Button variant="secondary" onClick={reset}>
              Discard
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: `Committed ${matched.length} matched rows`,
                  description: `${unmatched.length} row${unmatched.length === 1 ? '' : 's'} left for the exceptions queue.`,
                  tone: 'success',
                });
                reset();
              }}
            >
              Commit matches
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
