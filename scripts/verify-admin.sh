#!/bin/bash
# MEGA VERIFICATION SESSION — jalankan semua test dalam satu sesi bash
# agar proses dev server tidak dibunuh antar sesi.
set -x 2>/dev/null

cd /home/z/my-project

# 1. Pastikan server hidup
if ! curl -s -o /dev/null --max-time 2 http://localhost:3000/compare; then
  pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
  setsid nohup bun run dev < /dev/null > /dev/null 2>&1 &
  disown
fi

# Tunggu siap (maks 60s)
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/compare 2>/dev/null)
  if [ "$code" = "200" ]; then echo "SERVER READY"; break; fi
  sleep 1.5
done

echo "=== 1. Login admin via browser form ==="
agent-browser open http://localhost:3000/admin/login 2>&1 | head -2
sleep 2
agent-browser find label "Kata sandi" fill "bmp-admin-2026" 2>&1 | head -1
agent-browser find role button click --name "Masuk ke CMS" 2>&1 | head -1
sleep 6
echo "URL sekarang: $(agent-browser get url 2>/dev/null)"
echo "Judul: $(agent-browser get title 2>/dev/null)"

echo "=== 2. Buka halaman Leads & Quote ==="
agent-browser open http://localhost:3000/admin/leads 2>&1 | head -2
sleep 3
agent-browser snapshot 2>&1 | rg "Total leads|Rekomendasi AI|Quote dibuat|Budi Santoso|Q-20261025|Export CSV|baru|Daftar leads" | head -12

echo "=== 3. Errors check ==="
agent-browser errors 2>&1 | head -5

echo "=== 4. Screenshot ==="
agent-browser screenshot /tmp/admin-leads.png 2>&1 | head -1

echo "=== 5. Status update lead via form select ==="
REF=$(agent-browser snapshot -i -c 2>&1 | rg "combobox" | head -1 | rg -o "ref=e[0-9]+" | head -1)
echo "select ref: $REF"
if [ -n "$REF" ]; then
  agent-browser select "$REF" "dibalas" 2>&1 | head -1
  BTN=$(agent-browser snapshot -i -c 2>&1 | rg "button \"Simpan\"" | head -1 | rg -o "ref=e[0-9]+" | head -1)
  echo "button ref: $BTN"
  if [ -n "$BTN" ]; then
    agent-browser click "$BTN" 2>&1 | head -1
    sleep 3
    agent-browser snapshot 2>&1 | rg "Dibalas" | head -3
  fi
fi

echo "=== 6. Verifikasi CSV export berisi data ==="
COOKIE=$(bun -e "
import { createHmac } from 'node:crypto';
const payload = { email: 'admin@berkatmandiri.co.id', name: 'Admin', exp: Date.now() + 3600000 };
const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
const sig = createHmac('sha256', 'bmp-local-development-secret-v1').update(body).digest('base64url');
console.log('bmp_admin_session=' + body + '.' + sig);
" 2>/dev/null)
curl -s -b "$COOKIE" http://localhost:3000/api/admin/leads/export | head -4

echo "=== SELESAI ==="
