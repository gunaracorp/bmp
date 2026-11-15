#!/bin/bash
# Watchdog server BMP — memastikan Next.js dev server selalu hidup di port 3000.
# Loop: cek port 3000; jika mati, bersihkan cache rusak bila perlu, lalu start ulang.
cd /home/z/my-project

while true; do
  if ! curl -s -o /dev/null --max-time 15 http://localhost:3000/; then
    echo "[$(date '+%F %T')] Port 3000 mati — menyalakan ulang next dev..." >> watchdog.log
    # Jika cache Turbopack korup (panic log muncul), hapus cache agar bisa compile ulang.
    if ls /tmp/next-panic-*.log >/dev/null 2>&1 && rg -q "corrupted database" /tmp/next-panic-*.log 2>/dev/null; then
      rm -rf /tmp/next-panic-*.log .next
      echo "[$(date '+%F %T')] Cache Turbopack korup dibersihkan." >> watchdog.log
    fi
    # Bersihkan direktori runtime PGlite (jaga-jaga bila hilang saat recycle).
    for d in pg_commit_ts pg_dynshmem pg_notify pg_replslot pg_serial pg_snapshots \
             pg_stat pg_stat_tmp pg_tblspc pg_twophase pg_logical/mappings \
             pg_logical/snapshots pg_wal/archive_status pg_wal/summaries; do
      mkdir -p "db/pglite-data/$d"
    done
    node node_modules/.bin/next dev -p 3000 >> dev.log 2>&1 &
  fi
  sleep 15
done
