// Document repository — search + filter with sensitivity + category.

'use client';

import { ArrowLeft, Archive, Download, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ModuleTabs } from '@/components/erp/module-tabs';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import {
  CATEGORY_LABEL,
  DOCUMENTS,
  RETENTION_POLICIES,
  SENSITIVITY_LABEL,
  SENSITIVITY_TONE,
  type DocCategory,
  type DocSensitivity,
} from '@/mocks/fixtures/documents';

export default function DocumentsPage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<DocCategory | 'all'>('all');
  const [sens, setSens] = useState<DocSensitivity | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...DOCUMENTS].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    if (cat !== 'all')  r = r.filter((d) => d.category === cat);
    if (sens !== 'all') r = r.filter((d) => d.sensitivity === sens);
    const ql = q.trim().toLowerCase();
    if (ql) r = r.filter((d) =>
      d.title.toLowerCase().includes(ql) ||
      d.reference.toLowerCase().includes(ql) ||
      d.tags.some((t) => t.toLowerCase().includes(ql)),
    );
    return r;
  }, [q, cat, sens]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Document repository</h1>
            <p className="mt-1 text-small text-muted">{DOCUMENTS.length} records · retention policies across {RETENTION_POLICIES.length} categories.</p>
          </div>
        </div>
      </ScrollReveal>

      <ModuleTabs
        items={[
          { href: '/erp/documents',           label: 'Repository' },
          { href: '/erp/documents/retention', label: 'Retention policies' },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1 min-w-[220px]">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by title, reference or tag…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value as DocCategory | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABEL) as DocCategory[]).map((c) => (<option key={c} value={c}>{CATEGORY_LABEL[c]}</option>))}
          </select>
          <select value={sens} onChange={(e) => setSens(e.target.value as DocSensitivity | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All sensitivities</option>
            {(Object.keys(SENSITIVITY_LABEL) as DocSensitivity[]).map((s) => (<option key={s} value={s}>{SENSITIVITY_LABEL[s]}</option>))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Document</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Sensitivity</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-right">Size</th>
                <th className="px-5 py-3 text-left">Uploaded</th>
                <th className="px-5 py-3 text-left">Retain until</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                      <div>
                        <div className="font-semibold text-ink">{d.title}</div>
                        <div className="font-mono text-micro text-muted">{d.reference} · {d.filetype.toUpperCase()} · v{d.version}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {d.tags.map((t) => (<span key={t} className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-muted">{t}</span>))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{CATEGORY_LABEL[d.category]}</td>
                  <td className="px-5 py-3"><Badge tone={SENSITIVITY_TONE[d.sensitivity]}>{SENSITIVITY_LABEL[d.sensitivity]}</Badge></td>
                  <td className="px-5 py-3 text-muted">
                    <div className="text-ink">{d.owner}</div>
                    <div className="text-micro">{d.department}</div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{d.sizeKb} KB</td>
                  <td className="px-5 py-3 text-muted">{formatDate(d.uploadedAt)}</td>
                  <td className="px-5 py-3 text-micro text-muted">{formatDate(d.reviewDueAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" className="inline-flex items-center gap-1 text-micro font-semibold text-brand-primary hover:underline" aria-label={`Download ${d.title}`}>
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (<tr><td colSpan={8} className="px-5 py-10 text-center text-small text-muted">No documents match.</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
