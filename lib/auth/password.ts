import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Hashed password to compare against
 * @returns True if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if a string is a valid bcrypt hash
 * @param str String to check
 * @returns True if string is a valid bcrypt hash
 */
export function isBcryptHash(str: string): boolean {
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str);
}
