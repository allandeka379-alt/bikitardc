import type { ReactNode } from 'react';
import { ErpShell } from '@/components/shell/erp-shell';

export default function ErpLayout({ children }: { children: ReactNode }) {
  return <ErpShell>{children}</ErpShell>;
}
