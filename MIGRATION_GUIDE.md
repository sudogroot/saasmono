# Database Migration Guide

## Rules for Safe Migrations

### 1. Always Backward Compatible
- New columns must be NULLABLE or have DEFAULT values
- Never rename/delete columns in same PR as code changes
- Test with both old and new code running

### 2. Before Creating Migration
```bash
# Always pull latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/your-feature

# Make schema changes
# Generate migration
pnpm db:generate
```

### 3. Review Generated Migration
```bash
# Check the SQL file
cat apps/raqeem-backend/src/db/migrations/0001_*.sql

# Ensure:
# ✅ Column additions are nullable or have defaults
# ✅ No column renames/deletions
# ✅ No type changes
# ✅ Indexes are added with CONCURRENTLY (for large tables)
```

### 4. Test Locally
```bash
# Start fresh database
docker compose -f raqeem-deployment/docker-compose.local.yml down -v
docker compose -f raqeem-deployment/docker-compose.local.yml up -d

# Verify migration ran
docker logs raqeem-deployment-raqeem-backend-1 | grep migration
```

### 5. Test with Multiple PRs

**If multiple PRs with migrations are pending:**

```bash
# Merge main into your branch
git checkout feat/your-feature
git merge main

# Resolve any migration conflicts
# Run migrations locally with ALL pending changes
pnpm db:migrate

# Test full application
pnpm dev:raqeem
```

## Deployment Strategy

### Weekly Deploys with Multiple PRs

**Pre-Deployment Checklist:**

1. **List all pending migrations**
```bash
# Check what migrations will run
git diff production..main -- apps/raqeem-backend/src/db/migrations/
```

2. **Review for conflicts**
- Same table modified multiple times?
- Same column added twice?
- Dependent migrations in wrong order?

3. **Test on staging first**
```bash
# Deploy to staging environment
./deploy-stack.sh raqeem staging

# Run E2E tests
# Monitor logs
```

4. **Deploy to production**
```bash
# Deploy with migrations
./deploy-stack.sh raqeem production

# Monitor backend logs
docker service logs -f raqeem-production_backend

# Check migration status
docker service ps raqeem-production_backend
```

### If Migration Fails During Deploy

**Your current setup protects you:**
```yaml
# Backend won't start if migration fails
deploy:
  update_config:
    order: start-first  # New container with migration runs first
  restart_policy:
    condition: on-failure  # Container exits if migration fails
```

**Recovery steps:**
1. Old backend containers keep running (zero downtime)
2. Fix migration SQL
3. Rebuild and redeploy

## Breaking Changes (Multi-Phase)

**Phase 1: Expand** (Week 1)
```sql
-- Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;
```
```js
// Code supports both
const name = user.full_name || `${user.first_name} ${user.last_name}`
```

**Deploy and monitor for 1-2 weeks**

**Phase 2: Migrate Data** (Week 2)
```sql
-- Backfill data
UPDATE users SET full_name = first_name || ' ' || last_name WHERE full_name IS NULL;
```

**Phase 3: Contract** (Week 3)
```sql
-- Remove old columns
ALTER TABLE users DROP COLUMN first_name, DROP COLUMN last_name;
```
```js
// Code only uses new column
const name = user.full_name
```

## Common Pitfalls

### ❌ Don't Do This
```sql
-- PR #1: Add column
ALTER TABLE users ADD COLUMN status TEXT;

-- PR #2 same week: Make it required
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
-- 💥 This breaks if data isn't backfilled between deploys
```

### ✅ Do This Instead
```sql
-- PR #1: Add column with default
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
```

## CI/CD Integration

```yaml
# .github/workflows/pr-check.yml
name: Check Migrations

on:
  pull_request:
    paths:
      - 'apps/raqeem-backend/src/db/migrations/**'

jobs:
  check-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for migration conflicts
        run: |
          # Get all migration files in this PR
          git diff origin/main...HEAD --name-only | grep migrations

          # Check for common issues
          # - Duplicate column names
          # - Missing rollback migrations
          # - Unsafe operations

      - name: Test migrations
        run: |
          docker compose -f raqeem-deployment/docker-compose.local.yml up -d
          # Wait for migrations
          sleep 10
          # Check logs
          docker logs raqeem-deployment-raqeem-backend-1 | grep "Migrations completed"
```

## Quick Reference

**Safe operations:**
- ✅ ADD COLUMN (nullable or with default)
- ✅ CREATE TABLE
- ✅ CREATE INDEX CONCURRENTLY
- ✅ ADD CONSTRAINT (if data already valid)

**Unsafe operations (need multi-phase):**
- ❌ DROP COLUMN
- ❌ RENAME COLUMN
- ❌ ALTER COLUMN TYPE
- ❌ ALTER COLUMN SET NOT NULL (without default/backfill)
- ❌ DROP TABLE (that's still in use)
