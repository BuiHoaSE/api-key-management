import { randomBytes } from 'crypto'

/**
 * Generates a secure API key with the specified length
 * @param length The length of the API key to generate (default: 32)
 * @returns A secure random API key string
 */
export function generateApiKey(length: number = 32): string {
  return randomBytes(length).toString('hex')
} 