import crypto from 'crypto';

/**
 * Hashes a given string using the SHA-256 algorithm
 * @param input The string to hash
 * @returns The resulting hash as a hexadecimal string
 */
export const hashUrl = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};
