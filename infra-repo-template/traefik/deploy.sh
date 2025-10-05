#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying Traefik..."

# Load environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(cat "$SCRIPT_DIR/.env" | grep -v '^#' | xargs)
fi

# Create traefik-public network if it doesn't exist
if ! docker network ls | grep -q traefik-public; then
    echo "📡 Creating traefik-public network..."
    docker network create --driver=overlay traefik-public
fi

# Create certificate storage directory
echo "📁 Creating certificate directory..."
sudo mkdir -p /opt/projects/raqeem/traefik/letsencrypt
sudo chmod 600 /opt/projects/raqeem/traefik/letsencrypt

# Deploy Traefik stack
echo "🔧 Deploying Traefik stack..."
docker stack deploy -c "$SCRIPT_DIR/docker-compose.yml" traefik

echo ""
echo "✅ Traefik deployed successfully!"
echo ""
echo "📊 Check status:"
echo "   docker stack services traefik"
echo ""
echo "🌐 Dashboard available at:"
echo "   https://traefik.${DOMAIN:-localhost}"
