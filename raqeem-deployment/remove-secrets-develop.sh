#!/bin/bash
set -e

echo "🗑️  Removing Docker Swarm secrets for DEVELOP..."

# Remove secrets
docker secret rm raqeem_develop_postgres_user 2>/dev/null || echo "Secret raqeem_develop_postgres_user not found"
docker secret rm raqeem_develop_postgres_password 2>/dev/null || echo "Secret raqeem_develop_postgres_password not found"
docker secret rm raqeem_develop_better_auth_secret 2>/dev/null || echo "Secret raqeem_develop_better_auth_secret not found"
docker secret rm raqeem_develop_database_url 2>/dev/null || echo "Secret raqeem_develop_database_url not found"

echo ""
echo "✅ Development secrets removed!"
