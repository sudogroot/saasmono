#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying Raqeem to STAGING..."

# Load environment variables
if [ ! -f "$SCRIPT_DIR/.env.staging" ]; then
    echo "❌ Error: .env.staging file not found!"
    exit 1
fi

export $(cat "$SCRIPT_DIR/.env.staging" | grep -v '^#' | xargs)

# Check if Docker Swarm is initialized
if ! docker info | grep -q "Swarm: active"; then
    echo "⚠️  Docker Swarm is not initialized. Initializing now..."
    docker swarm init
fi

# Check if Docker secrets exist
echo "🔍 Checking Docker secrets..."
required_secrets=("raqeem_staging_postgres_user" "raqeem_staging_postgres_password" "raqeem_staging_better_auth_secret" "raqeem_staging_database_url")
missing_secrets=()

for secret in "${required_secrets[@]}"; do
    if ! docker secret inspect "$secret" &>/dev/null; then
        missing_secrets+=("$secret")
    fi
done

if [ ${#missing_secrets[@]} -ne 0 ]; then
    echo "❌ Error: The following Docker secrets are missing:"
    for secret in "${missing_secrets[@]}"; do
        echo "   - $secret"
    done
    echo ""
    echo "Please create secrets first with:"
    echo "   ./setup-secrets-staging.sh"
    exit 1
fi

echo "✅ All required secrets found"

# Create volume directories if they don't exist
echo "📁 Creating volume directories..."
ssh ${DEPLOY_HOST:-localhost} "mkdir -p /opt/projects/raqeem/staging/postgres-data" 2>/dev/null || sudo mkdir -p /opt/projects/raqeem/staging/postgres-data

# Check if DOCKER_REGISTRY is set (registry mode)
if [ -n "$DOCKER_REGISTRY" ]; then
    echo "📥 Pulling images from registry: $DOCKER_REGISTRY"
    docker pull ${DOCKER_REGISTRY}raqeem-backend:${IMAGE_TAG}
    docker pull ${DOCKER_REGISTRY}raqeem-frontend:${IMAGE_TAG}
else
    # Build images locally
    echo "📦 Building Docker images locally..."
    cd "$PROJECT_ROOT"
    docker build -f apps/raqeem-backend/Dockerfile -t raqeem-backend:staging .
    docker build -f apps/raqeem-frontend/Dockerfile \
        --build-arg NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
        -t raqeem-frontend:staging .
fi

# Deploy stack
echo "🔧 Deploying to Docker Swarm..."
docker stack deploy -c "$SCRIPT_DIR/docker-compose.staging.yml" raqeem-staging

# Show services
echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Service status:"
docker stack services raqeem-staging

echo ""
echo "💡 To run migrations on first deployment, run:"
echo "   cd raqeem-deployment && ./migrate-staging.sh"
echo ""
echo "📝 To view logs:"
echo "   docker service logs raqeem-staging_raqeem-backend -f"
echo "   docker service logs raqeem-staging_raqeem-frontend -f"
echo ""
echo "🔍 To check service status:"
echo "   docker stack services raqeem-staging"
