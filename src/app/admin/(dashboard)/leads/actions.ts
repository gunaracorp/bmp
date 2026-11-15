'use server';

/**
 * Server actions dashboard leads admin: ubah status lead.
 */
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getSalesDb, leadRequests } from '@/lib/sales-db';
import { isValidLeadStatus } from '@/lib/lead-normalizer';

export async function updateLeadStatusAction(leadId: string, status: string) {
  if (!isValidLeadStatus(status)) return;
  const db = getSalesDb();
  await db.update(leadRequests).set({ status, updatedAt: new Date() }).where(eq(leadRequests.id, leadId));
  revalidatePath('/admin/leads');
}
