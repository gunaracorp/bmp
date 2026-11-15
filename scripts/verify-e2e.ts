/**
 * Verifikasi end-to-end dalam SATU sesi:
 * 1. Start dev server (jika mati)
 * 2. Forge cookie sesi admin lokal (HMAC sama dengan auth-actions.ts)
 * 3. Test proteksi /admin, /admin/leads, CSV export
 * 4. Test rate halaman publik
 */
import { createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';

const BASE = 'http://localhost:3000';
const SECRET = 'bmp-local-development-secret-v1';

function makeAdminCookie() {
  const payload = {
    email: 'admin@berkatmandiri.co.id',
    name: 'Admin Berkat Mandiri',
    exp: Date.now() + 12 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(body).digest('base64url');
  return `bmp_admin_session=${body}.${sig}`;
}

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/compare`);
      if (res.status < 500) return true;
    } catch { /* belum hidup */ }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

async function main() {
  // 1. Cek server; hidupkan bila mati.
  let alive = false;
  try {
    alive = (await fetch(`${BASE}/compare`)).status < 500;
  } catch { alive = false; }

  if (!alive) {
    console.log('▶ Server mati — menjalankan bun run dev…');
    const child = spawn('bun', ['run', 'dev'], {
      cwd: '/home/z/my-project',
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    alive = await waitForServer();
    console.log(alive ? '✓ Server siap' : '✗ Server gagal start');
    if (!alive) process.exit(1);
  } else {
    console.log('✓ Server sudah hidup');
  }

  const cookie = makeAdminCookie();
  const results: string[] = [];

  async function check(path: string, opts: { cookie?: string; expect?: number; contains?: string } = {}) {
    const headers: Record<string, string> = {};
    if (opts.cookie) headers.cookie = opts.cookie;
    try {
      const res = await fetch(`${BASE}${path}`, { headers, redirect: 'manual' });
      const text = await res.text();
      const okStatus = opts.expect ? res.status === opts.expect : res.status < 400;
      const okContains = opts.contains ? text.includes(opts.contains) : true;
      const mark = okStatus && okContains ? '✓' : '✗';
      results.push(`${mark} ${path} → ${res.status}${opts.contains ? (okContains ? ' (berisi: ' + opts.contains + ')' : ' (TIDAK berisi: ' + opts.contains + ')') : ''}`);
      return { res, text };
    } catch (err) {
      results.push(`✗ ${path} → ERROR ${(err as Error).message}`);
      return null;
    }
  }

  // 2. Proteksi admin
  await check('/admin', { expect: 307 }); // tanpa cookie → redirect login
  await check('/admin', { cookie, expect: 200 }); // dengan cookie → dashboard
  await check('/admin/leads', { cookie, expect: 200, contains: 'Budi Santoso' }); // lead tersimpan
  await check('/admin/leads', { cookie, contains: 'Q-20261025' }); // quote muncul
  await check('/admin/leads', { cookie, contains: 'Leads & Quote' }); // judul dashboard

  // 3. CSV export
  const csv = await check('/api/admin/leads/export', { cookie, contains: 'id,created_at,name,company' });
  await check('/api/admin/leads/export', { expect: 401 }); // tanpa cookie → ditolak

  // 4. Halaman publik inti
  for (const path of ['/', '/ai-katalog', '/quote', '/compare', '/produk']) {
    await check(path, { expect: 200 });
  }

  // 5. Produk detail pertama dari katalog
  const produk = await fetch(`${BASE}/produk`);
  const produkHtml = await produk.text();
  const slugMatch = produkHtml.match(/\/produk\/([a-z0-9-]+)/);
  if (slugMatch) {
    await check(`/produk/${slugMatch[1]}`, { expect: 200, contains: 'Tambah ke Quote' });
    await check(`/ai-katalog/${slugMatch[1]}`, { expect: 307 }); // alias redirect
  }

  console.log('\n══════ HASIL VERIFIKASI ══════');
  for (const line of results) console.log(line);
  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\nTotal: ${results.length} check · gagal: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
