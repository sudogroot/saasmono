#!/bin/bash
set -e

echo "🔐 Setting up Docker Swarm secrets for DEVELOP..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load secrets from file
if [ ! -f "$SCRIPT_DIR/secrets-develop.env" ]; then
    echo "❌ Error: secrets-develop.env file not found!"
    echo "Please create it from the template and fill in the values."
    exit 1
fi

# Source the secrets file
source "$SCRIPT_DIR/secrets-develop.env"

# Create Docker secrets
echo "Creating Docker secrets..."

# Check if secrets already exist and remove them if needed
for secret in raqeem_develop_postgres_user raqeem_develop_postgres_password raqeem_develop_better_auth_secret raqeem_develop_database_url; do
    if docker secret inspect $secret &>/dev/null; then
        echo "⚠️  Secret $secret already exists. Remove it first with: docker secret rm $secret"
        echo "Or remove all develop secrets with: ./remove-secrets-develop.sh"
        exit 1
    fi
done

# Create secrets
echo "$POSTGRES_USER" | docker secret create raqeem_develop_postgres_user -
echo "$POSTGRES_PASSWORD" | docker secret create raqeem_develop_postgres_password -
echo "$BETTER_AUTH_SECRET" | docker secret create raqeem_develop_better_auth_secret -
echo "$DATABASE_URL" | docker secret create raqeem_develop_database_url -

echo ""
echo "✅ Development secrets created successfully!"
echo ""
echo "Secrets created:"
echo "  - raqeem_develop_postgres_user"
echo "  - raqeem_develop_postgres_password"
echo "  - raqeem_develop_better_auth_secret"
echo "  - raqeem_develop_database_url"
echo ""
echo "📝 To list all secrets:"
echo "   docker secret ls"
echo ""
echo "🚀 Now you can deploy with:"
echo "   ./deploy-develop.sh"
