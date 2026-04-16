'use client';

// Mocked client-side document uploader.
// Accepts any file; shows a fake progress bar per
// file and retains filename + size in local state.

import { CheckCircle2, FileText, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface UploadedFile {
  id: string;
  name: string;
  sizeBytes: number;
  mime: string;
  uploadedAt: string;
}

interface Props {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Required docs for this service. The caller can verify against these. */
  expected?: { label: string; hint?: string }[];
  maxMb?: number;
}

export function DocUploader({ value, onChange, expected, maxMb = 8 }: Props) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelect = useCallback(
    (files: FileList) => {
      const next: UploadedFile[] = [];
      Array.from(files).forEach((f) => {
        if (f.size > maxMb * 1024 * 1024) return;
        const id = `doc_${Math.random().toString(36).slice(2, 10)}`;
        next.push({
          id,
          name: f.name,
          sizeBytes: f.size,
          mime: f.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
        });

        // Fake progress
        setProgress((p) => ({ ...p, [id]: 10 }));
        const t = setInterval(() => {
          setProgress((p) => {
            const v = (p[id] ?? 10) + 25;
            if (v >= 100) {
              clearInterval(t);
              const rest = { ...p };
              delete rest[id];
              return rest;
            }
            return { ...p, [id]: v };
          });
        }, 200);
      });
      onChange([...value, ...next]);
    },
    [value, onChange, maxMb],
  );

  const remove = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

  return (
    <div>
      {expected && expected.length > 0 && (
        <ul className="mb-3 grid gap-1.5 rounded-md border border-dashed border-line bg-surface/50 px-4 py-3 text-small">
          <li className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
            Required documents
          </li>
          {expected.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-micro text-ink">
              <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-muted/50" aria-hidden />
              <div>
                <span className="font-medium">{d.label}</span>
                {d.hint && <div className="text-muted">{d.hint}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) onSelect(e.dataTransfer.files);
        }}
        className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line bg-card px-5 py-6 text-center transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/3"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">
          <Paperclip className="h-4 w-4" />
        </span>
        <div className="mt-1 text-small font-medium text-ink">
          Drop files or click to upload
        </div>
        <div className="text-micro text-muted">
          PDF, JPG, PNG up to {maxMb} MB. Multiple files allowed.
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onSelect(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {value.map((f) => {
            const p = progress[f.id];
            const done = p === undefined;
            return (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-md border border-line bg-card px-3 py-2.5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-surface text-muted" aria-hidden>
                  {f.mime.startsWith('image') ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate-line text-small font-medium text-ink">{f.name}</div>
                  <div className="text-micro text-muted">{formatBytes(f.sizeBytes)}</div>
                  {!done && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface">
                      <span
                        className="block h-full bg-brand-primary transition-[width] duration-base"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  )}
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-micro font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Uploaded
                  </span>
                ) : (
                  <span className="text-micro text-muted tabular-nums">{p ?? 0}%</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(f.id)}
                  aria-label={`Remove ${f.name}`}
                  className={cn('h-8 w-8 p-0')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
