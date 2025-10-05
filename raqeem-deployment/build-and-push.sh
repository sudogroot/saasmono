#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ENVIRONMENT="${ENVIRONMENT:-production}"

echo "🏗️  Building and pushing Raqeem images to registry..."
echo "Registry: $REGISTRY"
echo "Tag: $IMAGE_TAG"
echo "Environment: $ENVIRONMENT"
echo ""

# Build images
echo "📦 Building backend image..."
cd "$PROJECT_ROOT"
docker build \
    -f apps/raqeem-backend/Dockerfile \
    -t $REGISTRY/raqeem-backend:$IMAGE_TAG \
    -t $REGISTRY/raqeem-backend:$ENVIRONMENT \
    .

echo "📦 Building frontend image..."
docker build \
    -f apps/raqeem-frontend/Dockerfile \
    --build-arg NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL:-""} \
    -t $REGISTRY/raqeem-frontend:$IMAGE_TAG \
    -t $REGISTRY/raqeem-frontend:$ENVIRONMENT \
    .

# Push images
echo ""
echo "⬆️  Pushing images to registry..."
docker push $REGISTRY/raqeem-backend:$IMAGE_TAG
docker push $REGISTRY/raqeem-backend:$ENVIRONMENT
docker push $REGISTRY/raqeem-frontend:$IMAGE_TAG
docker push $REGISTRY/raqeem-frontend:$ENVIRONMENT

echo ""
echo "✅ Images built and pushed successfully!"
echo ""
echo "Images:"
echo "  - $REGISTRY/raqeem-backend:$IMAGE_TAG"
echo "  - $REGISTRY/raqeem-backend:$ENVIRONMENT"
echo "  - $REGISTRY/raqeem-frontend:$IMAGE_TAG"
echo "  - $REGISTRY/raqeem-frontend:$ENVIRONMENT"
echo ""
echo "💡 Next steps:"
echo "   1. Update infra repo to use these images"
echo "   2. Trigger redeployment on the server"
