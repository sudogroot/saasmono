#!/bin/bash
set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
echo ":PROJECT_ROOT"
echo ":$PROJECT_ROOT"
echo ":SCRIPT_DIR"
echo ":$SCRIPT_DIR"
echo ":"
echo "🚀 Deploying Raqeem LOCALLY with Docker Compose..."

# Load environment variables if .env.local exists
if [ -f "$SCRIPT_DIR/.env.local" ]; then
    export $(cat "$SCRIPT_DIR/.env.local" | grep -v '^#' | xargs)
fi

# Create secrets directory and files
echo "🔐 Setting up local secrets..."
mkdir -p "$SCRIPT_DIR/secrets"

# Check if secrets already exist
if [ ! -f "$SCRIPT_DIR/secrets/postgres_user.txt" ]; then
    echo "raqeem_local" > "$SCRIPT_DIR/secrets/postgres_user.txt"
    echo "local_password_123" > "$SCRIPT_DIR/secrets/postgres_password.txt"
    echo "local_better_auth_secret_min_32_chars_random" > "$SCRIPT_DIR/secrets/better_auth_secret.txt"
    echo "postgresql://raqeem_local:local_password_123@postgres:5432/raqeem_local" > "$SCRIPT_DIR/secrets/database_url.txt"
    echo "✅ Created default local secrets"
    echo "⚠️  You can edit these in raqeem-deployment/secrets/"
else
    echo "✅ Using existing local secrets"
fi

# Build and start services
echo "📦 Building and starting services..."
cd "$SCRIPT_DIR"
docker compose -f docker-compose.local.yml up --build -d

echo ""
echo "✅ Local deployment complete!"
echo ""
echo "🌐 Services available at:"
echo "   Frontend: http://localhost:4001"
echo "   Backend:  http://localhost:4000"
echo ""
echo "📝 To view logs:"
echo "   docker compose -f raqeem-deployment/docker-compose.local.yml logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker compose -f raqeem-deployment/docker-compose.local.yml down"
echo ""
echo "💡 To run migrations:"
echo "   docker compose -f raqeem-deployment/docker-compose.local.yml exec raqeem-backend pnpm db:migrate"
