#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load staging environment variables
if [ -f "$SCRIPT_DIR/.env.staging" ]; then
    export $(cat "$SCRIPT_DIR/.env.staging" | grep -v '^#' | xargs)
fi

export ENVIRONMENT=staging
export IMAGE_TAG=${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}

echo "Building staging images with tag: $IMAGE_TAG"

"$SCRIPT_DIR/build-and-push.sh"
