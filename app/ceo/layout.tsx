import type { ReactNode } from 'react';
import { CeoShell } from '@/components/shell/ceo-shell';

export default function CeoLayout({ children }: { children: ReactNode }) {
  return <CeoShell>{children}</CeoShell>;
}
