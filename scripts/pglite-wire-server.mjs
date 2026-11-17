/**
 * SERVER UJI: menyajikan snapshot PGlite lewat WIRE PROTOCOL Postgres asli
 * (paket @electric-sql/pglite-socket) — dipakai untuk menguji jalur
 * DATABASE_URL (driver pg/node-postgres) TANPA akun Neon.
 *
 * Jalankan:
 *   WIRE_SOURCE=/tmp/wire-db bun run scripts/pglite-wire-server.mjs
 * Lalu set DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const dataDir = process.env.WIRE_SOURCE ?? '/tmp/wire-db';
const port = Number(process.env.WIRE_PORT ?? 5433);

const db = new PGlite(dataDir);
await db.waitReady;
console.log(`[wire] PGlite terbuka di ${dataDir}`);

const server = new PGLiteSocketServer({
  db,
  port,
  host: '127.0.0.1',
  maxConnections: 8,
});
await server.start();
console.log(`[wire] READY — postgres://127.0.0.1:${port}/postgres`);
