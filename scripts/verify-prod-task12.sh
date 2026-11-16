#!/bin/bash
# Uji runtime produksi Next.js — dua jalur:
# A) Normal (dir writable)
# B) Simulasi Vercel: PGLITE_FORCE_TMP_COPY=1 + postmaster.pid basi (-42) di snapshot
cd /home/z/my-project

KILL() { pkill -f "next-server" 2>/dev/null; pkill -f "next start" 2>/dev/null; sleep 2; }

wait_up() { # $1=url, $2=maks detik
  for i in $(seq 1 $(( $2 / 2 ))); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$1" 2>/dev/null)
    [ "$code" = "200" ] && return 0
    sleep 2
  done
  return 1
}

KILL

echo "=========== UJI A: jalur normal produksi ==========="
rm -rf /tmp/pglite-data
nohup bun run start > /tmp/prod-test-a.log 2>&1 &
if wait_up http://localhost:3000/ 90; then
  echo "HOME 200"
  echo "  produk 'Bitzer' di /produk : $(curl -s --max-time 30 http://localhost:3000/produk | grep -o -i bitzer | wc -l)"
  echo "  /insights                  : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/insights)"
  echo "  URL sitemap                : $(curl -s --max-time 30 http://localhost:3000/sitemap.xml | grep -c '<url>')"
  echo "  CS Acep di home            : $(curl -s --max-time 30 http://localhost:3000/ | grep -o 'Acep Sihabudin' | wc -l)"
else
  echo "GAGAL — 30 baris log:"; tail -30 /tmp/prod-test-a.log; KILL; exit 1
fi
KILL

echo ""
echo "=========== UJI B: simulasi Vercel (read-only + pid basi) ==========="
rm -rf /tmp/pglite-data
printf -- "-42\n/pglite/data\n" > db/pglite-data/postmaster.pid   # pid hantu persis kasus asli
nohup env PGLITE_FORCE_TMP_COPY=1 bun run start > /tmp/prod-test-b.log 2>&1 &
if wait_up http://localhost:3000/ 120; then
  echo "HOME 200 (dari salinan /tmp!)"
  echo "  produk 'Bitzer' di /produk : $(curl -s --max-time 30 http://localhost:3000/produk | grep -o -i bitzer | wc -l)"
  echo "  /produk 200?               : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/produk)"
  echo "  /insights                  : $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://localhost:3000/insights)"
  echo "  URL sitemap                : $(curl -s --max-time 30 http://localhost:3000/sitemap.xml | grep -c '<url>')"
else
  echo "GAGAL — 40 baris log:"; tail -40 /tmp/prod-test-b.log; KILL; exit 1
fi

echo ""
echo "--- Bukti bootstrap di log UJI B ---"
grep -E "\[PGlite\]" /tmp/prod-test-b.log | head -5
KILL
rm -f db/pglite-data/postmaster.pid
echo "SELESAI — snapshot & lingkungan dibersihkan"
