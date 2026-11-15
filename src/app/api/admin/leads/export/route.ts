import { desc } from 'drizzle-orm';
import { getAdminUser } from '@/lib/auth';
import { getSalesDb, leadRequests } from '@/lib/sales-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CSV_HEADERS = [
  'id', 'created_at', 'name', 'company', 'phone', 'email', 'city',
  'need_type', 'description', 'source', 'status', 'quote_id',
];

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

/** GET /api/admin/leads/export — CSV leads untuk sales & marketing. */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getSalesDb();
  const leads = await db.select().from(leadRequests).orderBy(desc(leadRequests.createdAt)).limit(5000);

  const lines = [CSV_HEADERS.join(',')];
  for (const lead of leads) {
    lines.push([
      lead.id,
      lead.createdAt.toISOString(),
      lead.name,
      lead.company,
      lead.phone,
      lead.email,
      lead.city,
      lead.needType,
      lead.description,
      lead.source,
      lead.status,
      lead.quoteId,
    ].map(csvEscape).join(','));
  }

  const csv = `\uFEFF${lines.join('\n')}`; // BOM agar Excel membaca UTF-8
  const filename = `bmp-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
