// Legacy resident 360 route — forwards to the new CRM customer 360.

import { redirect } from 'next/navigation';

export default async function ResidentDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/erp/crm/${id}`);
}
