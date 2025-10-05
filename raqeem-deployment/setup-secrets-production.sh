#!/bin/bash
set -e

echo "🔐 Setting up Docker Swarm secrets for PRODUCTION..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load secrets from file
if [ ! -f "$SCRIPT_DIR/secrets-production.env" ]; then
    echo "❌ Error: secrets-production.env file not found!"
    echo "Please create it from the template and fill in the values."
    exit 1
fi

# Source the secrets file
source "$SCRIPT_DIR/secrets-production.env"

# Create Docker secrets
echo "Creating Docker secrets..."

# Check if secrets already exist and remove them if needed
for secret in raqeem_production_postgres_user raqeem_production_postgres_password raqeem_production_better_auth_secret raqeem_production_database_url; do
    if docker secret inspect $secret &>/dev/null; then
        echo "⚠️  Secret $secret already exists. Remove it first with: docker secret rm $secret"
        echo "Or remove all production secrets with: ./remove-secrets-production.sh"
        exit 1
    fi
done

# Create secrets
echo "$POSTGRES_USER" | docker secret create raqeem_production_postgres_user -
echo "$POSTGRES_PASSWORD" | docker secret create raqeem_production_postgres_password -
echo "$BETTER_AUTH_SECRET" | docker secret create raqeem_production_better_auth_secret -
echo "$DATABASE_URL" | docker secret create raqeem_production_database_url -

echo ""
echo "✅ Production secrets created successfully!"
echo ""
echo "Secrets created:"
echo "  - raqeem_production_postgres_user"
echo "  - raqeem_production_postgres_password"
echo "  - raqeem_production_better_auth_secret"
echo "  - raqeem_production_database_url"
echo ""
echo "📝 To list all secrets:"
echo "   docker secret ls"
echo ""
echo "🚀 Now you can deploy with:"
echo "   ./deploy-production.sh"
