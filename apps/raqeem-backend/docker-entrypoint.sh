#!/bin/sh
set -e  # Exit immediately if any command fails

echo "Starting raqeem-backend..."

# Load DATABASE_URL from secret file if it exists
if [ -f "$DATABASE_URL_FILE" ]; then
  export DATABASE_URL=$(cat "$DATABASE_URL_FILE")
  echo "Loaded DATABASE_URL from secret file"
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Cannot proceed with deployment."
  exit 1
fi

# Always run migrations on deployment
echo "Running database migrations..."
if ! pnpm db:migrate; then
  echo "ERROR: Database migrations failed!"
  echo "Deployment cannot continue. Please check your migration files and database connection."
  exit 1
fi
echo "✓ Migrations completed successfully"

echo "Starting server..."
# Execute the main command
exec "$@"
