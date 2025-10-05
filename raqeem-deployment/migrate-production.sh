#!/bin/bash
set -e

echo "🔄 Running database migrations for PRODUCTION..."

# Load environment variables
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

export $(cat .env.production | grep -v '^#' | xargs)

# Set RUN_MIGRATIONS to true
export RUN_MIGRATIONS=true

# Update the service with migration flag
echo "📦 Updating backend service to run migrations..."
docker service update \
    --env-add RUN_MIGRATIONS=true \
    --force \
    raqeem-production_raqeem-backend

echo ""
echo "✅ Migration task initiated!"
echo ""
echo "📝 Monitor the migration process:"
echo "   docker service logs raqeem-production_raqeem-backend -f"
echo ""
echo "⚠️  Important: After migrations complete, disable the migration flag:"
echo "   docker service update --env-add RUN_MIGRATIONS=false raqeem-production_raqeem-backend"
