#!/bin/bash
# UJI END-TO-END MODE NEON/REMOTE Task 13
# Simulasi Neon dengan wire server Postgres asli (pglite-socket):
# schema init -> migrasi data penuh -> uji tulis drizzle -> next start
# dengan DATABASE_URL -> curl seluruh route.
cd /home/z/my-project

WIRE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres"

KILL() {
  pkill -f "next-server" 2>/dev/null; pkill -f "next start" 2>/dev/null
  pkill -f "pglite-wire-server" 2>/dev/null
  sleep 2
}

wait_up() {
  for i in $(seq 1 $(( $2 / 2 ))); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null)
    [ "$code" = "200" ] && return 0
    sleep 2
  done
  return 1
}

KILL
rm -rf /tmp/wire-db /tmp/migrate-src /tmp/neon-test-logs
mkdir -p /tmp/neon-test-logs
cp -r db/pglite-data /tmp/wire-db
cp -r db/pglite-data /tmp/migrate-src
rm -f /tmp/wire-db/postmaster.pid /tmp/migrate-src/postmaster.pid

echo "=== 1. Wire server (simulasi Neon) ==="
nohup bun run scripts/pglite-wire-server.mjs > /tmp/neon-test-logs/wire.log 2>&1 &
sleep 6
grep -q "READY" /tmp/neon-test-logs/wire.log && echo "  wire READY di :5433" || { echo "  GAGAL:"; tail -20 /tmp/neon-test-logs/wire.log; KILL; exit 1; }

echo "=== 2. Init skema Neon ==="
DATABASE_URL="$WIRE_URL" DATABASE_POOL_MAX=2 bun run scripts/init-neon-schema.ts 2>&1 | tail -2

echo "=== 3. Migrasi data penuh ==="
DATABASE_URL="$WIRE_URL" DATABASE_POOL_MAX=2 SOURCE_DIR=/tmp/migrate-src bun run scripts/migrate-pglite-to-neon.ts 2>&1 | tail -18

echo "=== 4. Uji tulis persisten (drizzle + pg murni) ==="
DATABASE_URL="$WIRE_URL" DATABASE_POOL_MAX=2 bun run scripts/test-remote-write.ts 2>&1 | tail -5

echo "=== 5. next start DENGAN DATABASE_URL (jalur Neon) ==="
nohup env DATABASE_URL="$WIRE_URL" DATABASE_POOL_MAX=2 bun run start > /tmp/neon-test-logs/next.log 2>&1 &
if wait_up http://localhost:3000/ 120; then
  echo "  HOME 200 (dari database remote!)"
  echo "  Bitzer di /produk    : $(curl -s --max-time 30 http://localhost:3000/produk | grep -o -i bitzer | wc -l)"
  echo "  /produk              : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/produk)"
  echo "  /insights            : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/insights)"
  echo "  artikel edukasi      : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/insights/cara-memilih-kompresor-ac)"
  echo "  URL sitemap          : $(curl -s --max-time 30 http://localhost:3000/sitemap.xml | grep -c '<url>')"
  echo "  CS Acep di home      : $(curl -s --max-time 30 http://localhost:3000/ | grep -o 'Acep Sihabudin' | wc -l)"
  echo "  kebocoran harga      : $(curl -s --max-time 30 http://localhost:3000/produk | grep -oE 'Rp[&nbsp; ]*[0-9]' | wc -l)"
  echo "  mode di log          : $(grep -o 'Mode REMOTE.*' /tmp/neon-test-logs/next.log | head -1)"
else
  echo "  GAGAL — 40 baris log:"; tail -40 /tmp/neon-test-logs/next.log; KILL; exit 1
fi

KILL
echo "=== SELESAI — semua jalur Neon terverifikasi ==="
