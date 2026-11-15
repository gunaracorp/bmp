/**
 * Autentikasi admin CMS.
 *
 * Mode PRODUKSI (Neon Auth): aktif ketika NEON_AUTH_BASE_URL +
 * NEON_AUTH_COOKIE_SECRET + CMS_ADMIN_EMAIL tersedia — perilaku identik
 * dengan implementasi awal.
 *
 * Mode LOKAL (fallback sandbox/development): ketika env Neon tidak ada,
 * sesi admin disimpan pada cookie HttpOnly bertanda tangan HMAC. Kredensial
 * lokal diambil dari env (CMS_ADMIN_EMAIL / BMP_LOCAL_ADMIN_PASSWORD) atau
 * memakai default development. Tidak ada dependensi ke Neon Auth sehingga
 * modul ini aman diimpor di lingkungan tanpa konfigurasi.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

const neonConfigured = Boolean(baseUrl && cookieSecret);

export const LOCAL_ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL?.trim() || 'admin@berkatmandiri.co.id';
export const LOCAL_ADMIN_PASSWORD = process.env.BMP_LOCAL_ADMIN_PASSWORD || 'bmp-admin-2026';
const LOCAL_SESSION_COOKIE = 'bmp_admin_session';
const LOCAL_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

function localSigningSecret() {
  return cookieSecret || 'bmp-local-development-secret-v1';
}

type LocalSessionPayload = {
  email: string;
  name: string;
  exp: number;
};

function sign(value: string) {
  return createHmac('sha256', localSigningSecret()).update(value).digest('base64url');
}

function encodeLocalSession(payload: LocalSessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decodeLocalSession(raw: string | undefined): LocalSessionPayload | null {
  if (!raw) return null;
  const dotIndex = raw.lastIndexOf('.');
  if (dotIndex <= 0) return null;
  const body = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);
  const expected = sign(body);
  if (signature.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as LocalSessionPayload;
    if (!payload?.email || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

async function getNeonSessionUser(): Promise<SessionUser | null> {
  const auth = (await import('@neondatabase/auth/next/server')).createNeonAuth({
    baseUrl: baseUrl!,
    cookies: { secret: cookieSecret!, sessionDataTtl: 300 },
  });
  const { data } = await auth.getSession();
  if (!data?.user) return null;
  return { id: String(data.user.id ?? ''), email: String(data.user.email ?? ''), name: String(data.user.name ?? '') };
}

async function getLocalSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = decodeLocalSession(store.get(LOCAL_SESSION_COOKIE)?.value);
  if (!payload) return null;
  return { id: `local-${payload.email}`, email: payload.email, name: payload.name || 'Admin BMP' };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (neonConfigured) {
    try {
      return await getNeonSessionUser();
    } catch {
      return null;
    }
  }
  return getLocalSessionUser();
}

const FALLBACK_ADMIN_EMAIL = LOCAL_ADMIN_EMAIL.toLowerCase();

export async function getAdminUser(): Promise<SessionUser | null> {
  const [user, allowedEmail] = await Promise.all([
    getSessionUser().catch(() => null),
    Promise.resolve((process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase() || FALLBACK_ADMIN_EMAIL)),
  ]);

  if (!user || !allowedEmail || user.email.trim().toLowerCase() !== allowedEmail) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }
  return user;
}

export async function signOutAction() {
  'use server';
  if (neonConfigured) {
    const { createNeonAuth } = await import('@neondatabase/auth/next/server');
    const auth = createNeonAuth({
      baseUrl: baseUrl!,
      cookies: { secret: cookieSecret!, sessionDataTtl: 300 },
    });
    await auth.signOut();
  } else {
    const store = await cookies();
    store.delete(LOCAL_SESSION_COOKIE);
  }
  const { redirect } = await import('next/navigation');
  redirect('/admin/login');
}

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export function isAdminEmail(email: string | null | undefined) {
  const allowed = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase() || FALLBACK_ADMIN_EMAIL;
  return Boolean(email && email.trim().toLowerCase() === allowed);
}

export async function getCmsAdminSession() {
  const user = await getSessionUser().catch(() => null);
  return user && isAdminEmail(user.email) ? user : null;
}

export const AUTH_ROUTE_PATH = '/api/auth';

export function authConfigured() {
  return Boolean(baseUrl && cookieSecret && process.env.CMS_ADMIN_EMAIL);
}

export const ADMIN_LOGIN_PATH = '/admin/login';

/** Handler rute /api/auth — memakai Neon Auth saat terkonfigurasi, selain itu 404 JSON. */
async function neonHandler(request: Request) {
  const { createNeonAuth } = await import('@neondatabase/auth/next/server');
  const auth = createNeonAuth({
    baseUrl: baseUrl!,
    cookies: { secret: cookieSecret!, sessionDataTtl: 300 },
  });
  const handler = auth.handler();
  return handler(request);
}

export async function GET(request: Request) {
  if (!neonConfigured) return Response.json({ error: 'auth_not_configured' }, { status: 404 });
  return neonHandler(request);
}
export async function POST(request: Request) {
  if (!neonConfigured) return Response.json({ error: 'auth_not_configured' }, { status: 404 });
  return neonHandler(request);
}
export async function PUT(request: Request) {
  if (!neonConfigured) return Response.json({ error: 'auth_not_configured' }, { status: 404 });
  return neonHandler(request);
}
export async function DELETE(request: Request) {
  if (!neonConfigured) return Response.json({ error: 'auth_not_configured' }, { status: 404 });
  return neonHandler(request);
}
export async function PATCH(request: Request) {
  if (!neonConfigured) return Response.json({ error: 'auth_not_configured' }, { status: 404 });
  return neonHandler(request);
}

export const runtime = 'nodejs';
