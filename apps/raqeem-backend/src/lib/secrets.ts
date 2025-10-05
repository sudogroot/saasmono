import { readFileSync } from 'fs'

/**
 * Reads a secret from environment variable or file
 * Supports Docker Swarm secrets pattern where secrets are in /run/secrets/
 */
export function getSecret(envVar: string, envFileVar?: string): string {
  // First check if there's a _FILE variable (Docker Swarm secrets)
  const fileVar = envFileVar || `${envVar}_FILE`
  const secretFile = process.env[fileVar]

  if (secretFile) {
    try {
      const secret = readFileSync(secretFile, 'utf8').trim()
      return secret
    } catch (error) {
      console.error(`Failed to read secret from file ${secretFile}:`, error)
      throw new Error(`Failed to read secret from file: ${fileVar}`)
    }
  }

  // Fallback to environment variable
  const secret = process.env[envVar]
  if (!secret) {
    throw new Error(`Secret not found: ${envVar} or ${fileVar}`)
  }

  return secret
}

/**
 * Get DATABASE_URL from environment or file
 */
export function getDatabaseUrl(): string {
  return getSecret('DATABASE_URL')
}

/**
 * Get BETTER_AUTH_SECRET from environment or file
 */
export function getBetterAuthSecret(): string {
  return getSecret('BETTER_AUTH_SECRET')
}
