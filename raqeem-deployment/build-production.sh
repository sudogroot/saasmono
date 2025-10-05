#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load production environment variables
if [ -f "$SCRIPT_DIR/.env.production" ]; then
    export $(cat "$SCRIPT_DIR/.env.production" | grep -v '^#' | xargs)
fi

export ENVIRONMENT=production
export IMAGE_TAG=${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}

echo "Building production images with tag: $IMAGE_TAG"

"$SCRIPT_DIR/build-and-push.sh"
