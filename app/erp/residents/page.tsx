// The legacy residents directory has been replaced by the /erp/crm workspace.
// This stub preserves any bookmarked /erp/residents links by redirecting.

import { redirect } from 'next/navigation';

export default async function ResidentsRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const qs = sp.filter ? `?filter=${encodeURIComponent(sp.filter)}` : '';
  redirect(`/erp/crm${qs}`);
}
