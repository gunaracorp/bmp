#!/bin/bash
# UJI PAMUNGKAS v2: bukti aplikasi membaca database REMOTE, bukan lokal.
# Slug produk dicari dinamis, nama diubah di REMOTE saja, halaman dicek.
cd /home/z/my-project
WIRE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres"

KILL() { pkill -f "next-server" 2>/dev/null; pkill -f "next start" 2>/dev/null; pkill -f "pglite-wire-server" 2>/dev/null; sleep 2; }
wait_up() {
  for i in $(seq 1 40); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null)
    [ "$code" = "200" ] && return 0
    sleep 2
  done
  return 1
}

KILL
nohup bun run scripts/pglite-wire-server.mjs > /tmp/wire3.log 2>&1 &
sleep 6
grep -q READY /tmp/wire3.log || { echo "wire gagal"; KILL; exit 1; }

# Cari slug Bitzer yang benar dari DB remote
SLUG=$(DATABASE_URL="$WIRE_URL" bun -e '
import { Pool } from "pg";
const p = new Pool({ connectionString: process.env.DATABASE_URL });
const r = await p.query("SELECT slug FROM products WHERE brand = $1 ORDER BY id LIMIT 1", ["Bitzer"]);
console.log(r.rows[0]?.slug ?? "");
await p.end();
')
[ -z "$SLUG" ] && { echo "slug tidak ditemukan"; KILL; exit 1; }
echo "Slug uji : $SLUG"

nohup env DATABASE_URL="$WIRE_URL" DATABASE_POOL_MAX=2 bun run start > /tmp/next3.log 2>&1 &
wait_up "http://localhost:3000/produk/$SLUG" || { echo "next gagal"; tail -20 /tmp/next3.log; KILL; exit 1; }

# UBAH DI REMOTE SAJA (local pglite tidak disentuh)
DATABASE_URL="$WIRE_URL" bun -e '
import { Pool } from "pg";
const p = new Pool({ connectionString: process.env.DATABASE_URL });
await p.query("UPDATE products SET name = $1 WHERE slug = $2", ["ZZBUKTIREMOTE Uji Koneksi Remote", process.env.TEST_SLUG]);
await p.end();
' TEST_SLUG="$SLUG"

HTML=$(curl -s --max-time 20 "http://localhost:3000/produk/$SLUG")
if echo "$HTML" | grep -q "ZZBUKTIREMOTE"; then
  echo "SEBELUM : nama asli Bitzer"
  echo "SESUDAH : halaman menampilkan ZZBUKTIREMOTE"
  echo "TERBUKTI: halaman produk mengambil data dari DATABASE REMOTE (bukan lokal)"
  PASS=1
else
  echo "GAGAL: perubahan remote tidak terlihat"
  echo "$HTML" | grep -o '<title>[^<]*' | head -1
  PASS=0
fi

# PULIHKAN nama asli
ORIG=$(DATABASE_URL="$WIRE_URL" bun -e '
import { Pool } from "pg";
const p = new Pool({ connectionString: process.env.DATABASE_URL });
const r = await p.query("SELECT name FROM products WHERE slug = $1", [process.env.TEST_SLUG]);
console.log(r.rows[0]?.name.replace(/^ZZBUKTIREMOTE /, "") ?? "");
await p.end();
')
DATABASE_URL="$WIRE_URL" bun -e '
import { Pool } from "pg";
const p = new Pool({ connectionString: process.env.DATABASE_URL });
await p.query("UPDATE products SET name = $1 WHERE slug = $2", [process.env.ORIG_NAME, process.env.TEST_SLUG]);
await p.end();
' TEST_SLUG="$SLUG" ORIG_NAME="$ORIG"
curl -s --max-time 20 "http://localhost:3000/produk/$SLUG" | grep -o '<title>[^<]*' | head -1 | cut -c1-90

grep -a "\[DB\] Mode" /tmp/next3.log | head -1
KILL
[ "$PASS" = "1" ] && echo "=== UJI PAMUNGKAS LOLOS ===" || exit 1
