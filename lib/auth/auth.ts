import { cookies } from 'next/headers';
import { verifyPassword, isBcryptHash } from './password';

const AUTH_COOKIE = 'admin-auth';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_PASSWORD_LEGACY = process.env.ADMIN_PASSWORD;

// Fallback for backward compatibility (will be removed after migration)
const DEFAULT_PASSWORD = 'changeme123';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);
  return authCookie?.value === 'authenticated';
}

export async function authenticate(password: string): Promise<boolean> {
  let isValid = false;

  // Try hashed password first (preferred)
  if (ADMIN_PASSWORD_HASH) {
    isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  }
  // Fallback to legacy plain text password (for migration)
  else if (ADMIN_PASSWORD_LEGACY) {
    // Check if it's already a hash
    if (isBcryptHash(ADMIN_PASSWORD_LEGACY)) {
      isValid = await verifyPassword(password, ADMIN_PASSWORD_LEGACY);
    } else {
      // Plain text comparison (insecure, only for backward compat)
      console.warn(
        'WARNING: Using plain text password. Please set ADMIN_PASSWORD_HASH'
      );
      isValid = password === ADMIN_PASSWORD_LEGACY;
    }
  }
  // Final fallback to default (dev only)
  else {
    console.warn(
      'WARNING: No password configured. Using default password. SET ADMIN_PASSWORD_HASH!'
    );
    isValid = password === DEFAULT_PASSWORD;
  }

  if (isValid) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return true;
  }

  return false;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}
