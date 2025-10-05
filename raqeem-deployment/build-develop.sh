#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load develop environment variables
if [ -f "$SCRIPT_DIR/.env.develop" ]; then
    export $(cat "$SCRIPT_DIR/.env.develop" | grep -v '^#' | xargs)
fi

# Load local overrides (gitignored)
if [ -f "$SCRIPT_DIR/.env.develop.local" ]; then
    export $(cat "$SCRIPT_DIR/.env.develop.local" | grep -v '^#' | xargs)
fi

export ENVIRONMENT=develop
export IMAGE_TAG=${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}

echo "Building develop images with tag: $IMAGE_TAG"

"$SCRIPT_DIR/build-and-push.sh"
