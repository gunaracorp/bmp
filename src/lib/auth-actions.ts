'use server';

/**
 * Server actions autentikasi lokal (mode sandbox/development).
 * File terpisah dengan directive 'use server' top-level agar aman diimpor
 * langsung oleh Client Component (admin-login-form) tanpa menyeret modul
 * server lain (next/headers) ke bundel client.
 */
import { cookies } from 'next/headers';

const LOCAL_SESSION_COOKIE = 'bmp_admin_session';

/**
 * Login lokal: memvalidasi kredensial dan menandatangani cookie sesi.
 * Kredensial diambil dari env CMS_ADMIN_EMAIL / BMP_LOCAL_ADMIN_PASSWORD
 * (memakai default development bila tidak diset).
 */
export async function localSignInAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const { createHmac, timingSafeEqual } = await import('node:crypto');

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const adminEmail = (process.env.CMS_ADMIN_EMAIL?.trim() || 'admin@berkatmandiri.co.id').toLowerCase();
  const adminPassword = process.env.BMP_LOCAL_ADMIN_PASSWORD || 'bmp-admin-2026';

  if (email !== adminEmail || password !== adminPassword) {
    return { error: 'Email atau kata sandi tidak sesuai. Periksa kembali lalu coba lagi.' };
  }

  // Tanda tangan sesi (HMAC) — payload berisi email, nama, dan masa berlaku.
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || 'bmp-local-development-secret-v1';
  const payload = {
    email: adminEmail,
    name: 'Admin Berkat Mandiri',
    exp: Date.now() + 12 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');

  const store = await cookies();
  store.set(LOCAL_SESSION_COOKIE, `${body}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return {};
}

/** Logout lokal — hapus cookie sesi lalu ke halaman login. */
export async function localSignOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(LOCAL_SESSION_COOKIE);
  const { redirect } = await import('next/navigation');
  redirect('/admin/login');
}
