/**
 * dev-guard — dijalankan otomatis sebelum `next dev` setiap kali platform
 * menyalakan server (`bun run dev`).
 *
 * Tugasnya membuat setiap boot bersifat menyembuhkan diri (self-healing):
 * 1. Memastikan seluruh direktori runtime PostgreSQL/PGlite ada. Direktori
 *    kosong ini sering hilang saat sandbox di-recycle, sehingga Postgres
 *    gagal start (FATAL "could not open directory \"pg_notify\"") dan halaman
 *    melempar "PGlite failed to initialize properly" (digest 4014266242).
 * 2. Menghapus postmaster.pid basi. Setelah recycle, PID di file itu tidak
 *    pernah ada lagi di /proc (bahkan bisa negatif) — kalau dibiarkan, PGlite
 *    WASM abort saat init ("RuntimeError: Aborted()") dan semua rute 500.
 * 3. Mendeteksi panic Turbopack akibat cache `.next` korup ("Failed to
 *    restore task data (corrupted database or bug)") yang tertinggal saat
 *    recycle terjadi di tengah compile, lalu menghapus cache agar Turbopack
 *    melakukan kompilasi ulang yang bersih.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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

function ensurePgliteRuntimeDirs() {
  const dataDir = path.join(process.cwd(), 'db', 'pglite-data');
  if (!fs.existsSync(dataDir)) return;
  for (const dir of PGLITE_RUNTIME_DIRS) {
    try {
      fs.mkdirSync(path.join(dataDir, dir), { recursive: true });
    } catch {
      /* abaikan — PGlite akan melaporkan error sebenarnya bila ada */
    }
  }
}

/**
 * Hapus postmaster.pid basi: PGlite menjalankan Postgres in-process,
 * jadi PID di file itu HARUS proses hidup pada sandbox ini. PID negatif
 * atau yang tidak ada di /proc berarti sisa sesi lama — wajib dibuang
 * sebelum PGlite diinisialisasi, jika tidak WASM abort (Aborted()).
 */
function removeStalePostmasterPid() {
  const dataDir = path.join(process.cwd(), 'db', 'pglite-data');
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (!fs.existsSync(pidFile)) return;
  try {
    const firstLine = fs.readFileSync(pidFile, 'utf8').split('\n')[0]?.trim() ?? '';
    const pid = Number.parseInt(firstLine, 10);
    const alive = Number.isInteger(pid) && pid > 0 && fs.existsSync(`/proc/${pid}`);
    if (alive) {
      console.log(`[dev-guard] postmaster.pid PID ${pid} masih hidup — dibiarkan.`);
      return;
    }
    fs.rmSync(pidFile, { force: true });
    console.log(
      `[dev-guard] postmaster.pid basi dihapus (PID "${firstLine}" tidak ada di /proc) — PGlite bisa init bersih.`,
    );
  } catch {
    /* abaikan */
  }
}

function cleanCorruptTurbopackCache() {
  try {
    const panics = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith('next-panic-'));
    for (const file of panics) {
      const full = path.join(os.tmpdir(), file);
      let content = '';
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      if (content.includes('corrupted database') || content.includes('Failed to restore task data')) {
        fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });
        fs.rmSync(full, { force: true });
        console.log('[dev-guard] Cache Turbopack korup dibersihkan — kompilasi ulang bersih.');
      }
    }
  } catch {
    /* abaikan */
  }
}

ensurePgliteRuntimeDirs();
removeStalePostmasterPid();
cleanCorruptTurbopackCache();
console.log('[dev-guard] Siap: direktori runtime PGlite terjamin, postmaster.pid diperiksa, cache diperiksa.');
