# Docker Swarm Secrets Management

This guide explains how to manage Docker Swarm secrets for the Raqeem deployment.

## What are Docker Swarm Secrets?

Docker Swarm secrets are a secure way to store sensitive data (passwords, API keys, etc.) that can be accessed by services running in a Docker Swarm cluster. Secrets are:

- **Encrypted** at rest and in transit
- **Only accessible** to services that are granted explicit access
- **Mounted** as files in `/run/secrets/` inside containers
- **Not stored** in images or environment variables

## Secret Files

Each environment has its own secrets configuration file:

- `secrets-production.env` - Production secrets
- `secrets-staging.env` - Staging secrets
- `secrets-develop.env` - Development secrets

**⚠️ IMPORTANT:** These files are gitignored and should NEVER be committed to version control!

## Required Secrets

Each environment requires the following secrets:

### 1. `postgres_user`
PostgreSQL database username

### 2. `postgres_password`
PostgreSQL database password (use a strong, random password)

### 3. `better_auth_secret`
BetterAuth secret key (minimum 32 characters, cryptographically random)

### 4. `database_url`
Complete PostgreSQL connection string
Format: `postgresql://USER:PASSWORD@postgres:5432/DATABASE_NAME`

## Setup Process

### 1. Create Secrets Configuration

Copy and edit the secrets file for your environment:

```bash
cd raqeem-deployment

# For production
nano secrets-production.env
```

Update all values with strong, random passwords and keys. Example:

```bash
POSTGRES_USER=raqeem_prod
POSTGRES_PASSWORD=xK9mP2nQ7vL4zR8wE5tY1cA6sD3fG0hJ
BETTER_AUTH_SECRET=aB4cD8eF2gH6iJ0kL5mN9oP3qR7sT1uV
DATABASE_URL=postgresql://raqeem_prod:xK9mP2nQ7vL4zR8wE5tY1cA6sD3fG0hJ@postgres:5432/raqeem_production
```

**Pro tip:** Generate secure passwords with:
```bash
openssl rand -base64 32
```

### 2. Create Docker Secrets

Run the setup script to create Docker Swarm secrets:

```bash
# Production
./setup-secrets-production.sh

# Staging
./setup-secrets-staging.sh

# Development
./setup-secrets-develop.sh
```

### 3. Verify Secrets

List all secrets to verify they were created:

```bash
docker secret ls
```

You should see output like:
```
ID                          NAME                                      CREATED
abc123...                   raqeem_production_postgres_user           10 seconds ago
def456...                   raqeem_production_postgres_password       10 seconds ago
ghi789...                   raqeem_production_better_auth_secret      10 seconds ago
jkl012...                   raqeem_production_database_url            10 seconds ago
```

### 4. Deploy

Now you can deploy your stack:

```bash
./deploy-production.sh
```

## Updating Secrets

Docker Swarm secrets are **immutable** - they cannot be updated once created. To change a secret:

### 1. Remove the old secret

```bash
# Remove all production secrets
./remove-secrets-production.sh

# Or remove individual secrets
docker secret rm raqeem_production_postgres_password
```

**⚠️ WARNING:** This will require redeploying services!

### 2. Update the secrets file

Edit your `secrets-*.env` file with new values.

### 3. Recreate secrets

```bash
./setup-secrets-production.sh
```

### 4. Redeploy services

```bash
./deploy-production.sh
```

## Secret Rotation Best Practices

1. **Regular Rotation**: Rotate secrets every 90 days minimum
2. **Emergency Rotation**: Rotate immediately if:
   - A secret is compromised
   - An employee with access leaves
   - A security breach is suspected

3. **Document Changes**: Keep a log of when secrets were rotated (not the values!)
4. **Test in Staging**: Always test secret rotation in staging first

## How Secrets Work in the Backend

The backend reads secrets from files automatically:

1. Docker mounts secrets to `/run/secrets/` in containers
2. The backend's `src/lib/secrets.ts` module:
   - Checks for `*_FILE` environment variables (e.g., `DATABASE_URL_FILE`)
   - Reads the secret from the file path
   - Falls back to regular environment variables for local development

Example backend code:
```typescript
import { getDatabaseUrl } from './lib/secrets'

// Automatically reads from file in production or env var in development
const dbUrl = getDatabaseUrl()
```

## Troubleshooting

### Secret not found error

```
Error: Secret not found: raqeem_production_postgres_user
```

**Solution:** Run the setup script: `./setup-secrets-production.sh`

### Secret already exists error

```
Error: secret already exists: raqeem_production_postgres_user
```

**Solution:** Remove existing secrets first: `./remove-secrets-production.sh`

### Service won't start after secret update

**Solution:** Secrets are immutable. You must:
1. Remove the old stack: `docker stack rm raqeem-production`
2. Remove old secrets: `./remove-secrets-production.sh`
3. Create new secrets: `./setup-secrets-production.sh`
4. Redeploy: `./deploy-production.sh`

### Cannot read secret file

**Solution:** Check that:
1. The secret exists: `docker secret ls`
2. The service has access to the secret (check docker-compose.yml)
3. The `*_FILE` environment variable is set correctly

## Security Tips

1. **Never commit secrets files** - They're gitignored, keep it that way
2. **Use different secrets per environment** - Production and staging should have different passwords
3. **Restrict secret access** - Only grant secrets to services that need them
4. **Monitor secret access** - Check Docker logs for unauthorized access attempts
5. **Backup secrets securely** - Store production secrets in a secure password manager
6. **Use strong passwords** - Minimum 32 characters, random, cryptographic
7. **Enable audit logging** - Track who accesses secrets and when

## Environment-Specific Secrets

Each environment should have unique secrets:

| Environment | Database | Auth Secret | Purpose |
|-------------|----------|-------------|---------|
| Production  | Strong 32+ char | Strong 32+ char | Live production data |
| Staging     | Strong 32+ char | Strong 32+ char | Pre-production testing |
| Development | Medium strength | Medium strength | Development testing |

**Never use production secrets in other environments!**
