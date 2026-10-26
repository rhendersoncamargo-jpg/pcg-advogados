import { pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Generates a random 16-byte salt in hex format.
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Hashes a password with a given salt using PBKDF2.
 */
export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}
