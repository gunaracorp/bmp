/**
 * PGlite in-process client — PostgreSQL tertanam (WASM) di dalam aplikasi.
 *
 * Repo ini berjalan di environment sandbox tanpa server Postgres eksternal,
 * sementara `pg` Pool butuh DATABASE_URL. Data katalog (620 produk) sudah
 * ada di `db/pglite-data/`, maka semua akses DB kini melalui satu instance
 * PGlite yang di-cache di globalThis (aman terhadap HMR Next.js).
 *
 * Konstruktor `new PGlite()` bersifat sinkron — inisialisasi internal berjalan
 * asinkron dan setiap `.query()` otomatis menunggu `_checkReady`, sehingga
 * instance langsung aman dipakai drizzle tanpa proxy tambahan.
 *
 * PRODUKSI (Vercel & friends) — bootstrap production-safe:
 * 1. Filesystem serverless read-only (kecuali /tmp) → snapshot disalin ke
 *    /tmp/pglite-data sekali per instance sebelum dibuka (marker PG_VERSION).
 * 2. postmaster.pid basi dari snapshot (mis. PID -42 dari mesin lain) dihapus
 *    dulu — kalau tidak, Postgres mengira ada instance lain memegang lock dan
 *    init WASM abort: "RuntimeError: Aborted()" → 500 di seluruh situs.
 * 3. Snapshot wajib ikut ke bundle serverless lewat outputFileTracingIncludes
 *    di next.config.ts; kalau tidak ada, error dilempar JELAS (bukan DB kosong
 *    diam-diam) agar mudah didiagnosis di log Vercel.
 *
 * Catatan lingkungan produksi (Neon): cukup set DATABASE_URL dan kembalikan
 * driver `drizzle-orm/node-postgres` di cms-db.ts bila ingin kembali memakai
 * Neon Postgres.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const globalForPglite = globalThis as typeof globalThis & {
  __bmpPglite?: PGlite;
};

export function resolvePgliteDataDir(): string {
  return process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
}

/**
 * Direktori runtime PostgreSQL yang dibuat initdb sebagai direktori KOSONG.
 * Environment sandbox yang di-recycle dapat menghilangkan direktori kosong
 * (isi file tetap ada), sehingga Postgres gagal start dengan FATAL
 * "could not open directory \"pg_notify\"" dan PGlite melempar
 * "PGlite failed to initialize properly". Fungsi ini memastikan semua
 * direktori tersebut ada sebelum instance PGlite dibuat — perbaikan
 * otomatis dan idempoten.
 */
const PGLITE_RUNTIME_DIRS = [
  'pg_commit_ts',
  'pg_dynshmem',
  'pg_logical/mappings',
  'pg_logical/snapshots',
  'pg_notify',
  'pg_replslot',
  'pg_serial',
  'pg_snapshots',
  'pg_stat',
  'pg_stat_tmp',
  'pg_tblspc',
  'pg_twophase',
  'pg_wal/archive_status',
  'pg_wal/summaries',
];

export function ensurePgliteRuntimeDirs(dataDir: string): void {
  try {
    for (const dir of PGLITE_RUNTIME_DIRS) {
      fs.mkdirSync(path.join(dataDir, dir), { recursive: true });
    }
  } catch {
    // Biarkan PGlite yang melaporkan error sebenarnya bila pembuatan gagal.
  }
}

/** Cek PID valid & hidup — portabel (tanpa /proc), cukup sinyal 0. */
function isPidAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // ESRCH = proses tidak ada (basi). EPERM = proses ada tapi bukan milik
    // kita → anggap hidup agar tidak menghapus pid milik instance lain.
    return (err as NodeJS.ErrnoException)?.code === 'EPERM';
  }
}

/**
 * Hapus postmaster.pid basi sebelum PGlite dibuka.
 *
 * Snapshot DB yang ter-commit dapat membawa postmaster.pid dari mesin lain
 * (kasus nyata: PID -42). Postgres mengira ada instance lain yang memegang
 * lock database → inisialisasi WASM abort → seluruh halaman 500. Fungsi ini
 * idempoten dan aman dipanggil di setiap pembukaan instance baru.
 */
export function removeStalePostmasterPid(dataDir: string): void {
  const pidFile = path.join(dataDir, 'postmaster.pid');
  try {
    if (!fs.existsSync(pidFile)) return;
    const firstLine = fs.readFileSync(pidFile, 'utf8').split('\n')[0]?.trim() ?? '';
    const pid = Number.parseInt(firstLine, 10);
    if (isPidAlive(pid)) return;
    fs.rmSync(pidFile, { force: true });
    console.log(`[PGlite] postmaster.pid basi dihapus (pid=${firstLine}) — pemulihan otomatis`);
  } catch (err) {
    console.warn('[PGlite] gagal memeriksa postmaster.pid:', err);
  }
}

/**
 * Uji tulis NYATA, bukan sekadar accessSync(W_OK): mount read-only tetap
 * ditolak kernel walau bit izin terlihat boleh-tulis.
 */
function dirIsWritable(dir: string): boolean {
  try {
    const probe = path.join(dir, `.pglite-write-test-${process.pid}`);
    fs.writeFileSync(probe, '1');
    fs.rmSync(probe, { force: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolusi data dir yang aman untuk SEMUA lingkungan:
 * - Sandbox dev / VM biasa: db/pglite-data writable → dipakai langsung.
 * - Serverless (Vercel): /var/task read-only → snapshot disalin ke
 *   /tmp/pglite-data sekali per instance (marker PG_VERSION), lalu instance
 *   PGlite membuka salinan itu.
 * - PGLITE_FORCE_TMP_COPY=1 memaksa jalur /tmp — untuk menguji jalur serverless
 *   di mesin lokal.
 */
function resolveWritableDataDir(): string {
  const sourceDir = resolvePgliteDataDir();
  const forceTmpCopy = process.env.PGLITE_FORCE_TMP_COPY === '1';

  if (!forceTmpCopy && dirIsWritable(sourceDir)) {
    return sourceDir;
  }

  if (!fs.existsSync(sourceDir)) {
    throw new Error(
      `[PGlite] Snapshot database tidak ditemukan di "${sourceDir}". ` +
        'Pada deploy Vercel pastikan next.config.ts memuat outputFileTracingIncludes ' +
        "untuk './db/pglite-data/**' agar snapshot ikut ke bundle serverless.",
    );
  }

  const tmpDir = process.env.PGLITE_TMP_DIR ?? '/tmp/pglite-data';
  const marker = path.join(tmpDir, 'PG_VERSION');
  if (fs.existsSync(marker)) {
    console.log(`[PGlite] memakai salinan /tmp yang sudah ada: ${tmpDir}`);
    return tmpDir;
  }

  console.log(`[PGlite] filesystem read-only / copy dipaksa — salin snapshot ${sourceDir} → ${tmpDir}`);
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.cpSync(sourceDir, tmpDir, { recursive: true, force: true });
  } catch (err) {
    throw new Error(`[PGlite] gagal menyalin snapshot ke ${tmpDir}: ${String(err)}`);
  }
  return tmpDir;
}

/** Ambil (atau buat) instance PGlite tunggal — sinkron, siap dipakai langsung. */
export function getPgliteSync(): PGlite {
  if (!globalForPglite.__bmpPglite) {
    const dataDir = resolveWritableDataDir();
    ensurePgliteRuntimeDirs(dataDir);
    removeStalePostmasterPid(dataDir);
    globalForPglite.__bmpPglite = new PGlite(dataDir);
  }
  return globalForPglite.__bmpPglite;
}

/** Versi asinkron untuk skrip CLI (tetap satu instance yang sama). */
export async function getPglite(): Promise<PGlite> {
  const db = getPgliteSync();
  await db.waitReady;
  return db;
}
