#!/bin/bash
# Verifikasi Task 10: kontak CS (Acep & Gugun) + artikel kategori/edukasi live
cd /home/z/my-project
rm -f /tmp/dev-task10.log
nohup bun run dev > /tmp/dev-task10.log 2>&1 &
echo "Server booting..."

ok=0
for i in $(seq 1 90); do
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000/ 2>/dev/null)
  if [ "$code" = "200" ]; then ok=1; echo "HOME 200 setelah $((i*2)) detik"; break; fi
done
if [ "$ok" != "1" ]; then echo "GAGAL BOOT — 50 baris terakhir dev.log:"; tail -50 /tmp/dev-task10.log; exit 1; fi

echo ""
echo "=== 1. Kontak CS tampil di homepage ==="
H=$(curl -s --max-time 30 http://localhost:3000/)
for pat in "Acep Sihabudin" "6281220030092" "Gugun Gunara" "6281316516524" "Tim Customer Service"; do
  n=$(echo "$H" | grep -o "$pat" | wc -l)
  echo "  '$pat': $n kemunculan"
done

echo ""
echo "=== 2. JSON-LD contactPoint (customer support) ==="
n=$(echo "$H" | grep -o '"contactType":"customer support"' | wc -l)
echo "  entri customer support: $n (harap >= 2)"
echo "$H" | grep -o '"name":"H. Gugun Gunara, S.E., M.M"' | head -1
echo "$H" | grep -o '"name":"Acep Sihabudin"' | head -1

echo ""
echo "=== 3. Sitemap ==="
S=$(curl -s --max-time 30 http://localhost:3000/sitemap.xml)
total=$(echo "$S" | grep -c "<url>")
ins=$(echo "$S" | grep -o "/insights/" | wc -l)
echo "  total URL sitemap: $total"
echo "  URL /insights/*: $ins (harap 41)"

echo ""
echo "=== 4. Semua artikel /insights harus 200 ==="
SLUGS=$(echo "$S" | grep -o "https://[^<]*/insights/[^<]*" | sed 's|https://www.berkatmandiripendingin.com||' | sort -u)
fail=0; pass=0
for u in $SLUGS; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://localhost:3000$u")
  if [ "$code" = "200" ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "  GAGAL: $u → $code"; fi
done
echo "  hasil: $pass OK, $fail gagal (total $(echo "$SLUGS" | wc -l))"

echo ""
echo "=== 5. Artikel sampel edukasi & kategori — konten + JSON-LD + CS di footer ==="
A=$(curl -s --max-time 30 http://localhost:3000/insights/cara-memilih-kompresor-ac)
echo "  'Cara Memilih' muncul: $(echo "$A" | grep -o -i "cara memilih" | wc -l)"
echo "  FAQPage JSON-LD: $(echo "$A" | grep -o '"@type":"FAQPage"' | wc -l)"
echo "  Acep di footer artikel: $(echo "$A" | grep -o "Acep Sihabudin" | wc -l)"
B=$(curl -s --max-time 30 http://localhost:3000/insights/perbedaan-kompresor-rotary-scroll-piston-screw)
echo "  artikel perbedaan tipe: $(echo "$B" | grep -o -i "perbedaan" | head -1)"

echo ""
echo "=== 6. Cek kebocoran harga (Rp <angka>) ==="
for p in "/" "/insights" "/produk"; do
  c=$(curl -s --max-time 30 "http://localhost:3000$p" | grep -oE "Rp&nbsp;?[0-9]|Rp [0-9]" | wc -l)
  echo "  $p: $c kebocoran"
done

echo ""
echo "=== 7. Link wa.me CS terformat benar ==="
echo "$H" | grep -o "wa.me/6281220030092" | wc -l
echo "$H" | grep -o "wa.me/6281316516524" | wc -l

echo ""
echo "SELESAI"
