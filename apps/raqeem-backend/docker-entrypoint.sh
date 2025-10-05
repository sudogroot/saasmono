#!/bin/sh
set -e

echo "Starting raqeem-backend..."

# Load DATABASE_URL from secret file if it exists
if [ -f "$DATABASE_URL_FILE" ]; then
  export DATABASE_URL=$(cat "$DATABASE_URL_FILE")
  echo "Loaded DATABASE_URL from secret file"
fi

# Check if RUN_MIGRATIONS is set to true
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  pnpm db:migrate
  echo "Migrations completed successfully"
else
  echo "Skipping migrations (RUN_MIGRATIONS not set to true)"
fi

# Execute the main command
exec "$@"
