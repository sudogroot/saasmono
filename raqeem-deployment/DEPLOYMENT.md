# Raqeem Deployment Guide

This guide covers deploying the Raqeem application (frontend and backend) to Docker Swarm across multiple environments.

## Prerequisites

- Docker installed and running
- Docker Swarm initialized (`docker swarm init`)
- Domain names configured (for production/staging)
- SSL certificates configured (using Traefik or similar)

## Environments

The project supports three deployment environments:
- **Production** - Live production environment
- **Staging** - Pre-production testing environment
- **Develop** - Development/testing environment

## Architecture

Each environment includes:
- **PostgreSQL** - Database (1 replica, manager node)
- **raqeem-backend** - Node.js backend API (Express + betterAuth + oRPC)
- **raqeem-frontend** - Next.js frontend application

## Configuration

### 1. Environment Variables

Each environment has its own `.env` file:
- `.env.production` - Production configuration
- `.env.staging` - Staging configuration
- `.env.develop` - Development configuration

**Important**: Update these files with your actual values before deploying!

Required variables:
```bash
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=strong_random_password

# CORS and Auth
CORS_ORIGIN=https://your-frontend-domain.com
BETTER_AUTH_SECRET=min_32_character_random_string
BETTER_AUTH_URL=https://your-backend-domain.com

# Frontend
NEXT_PUBLIC_SERVER_URL=https://your-backend-domain.com

# Domains (for Traefik labels)
BACKEND_DOMAIN=api.your-domain.com
FRONTEND_DOMAIN=app.your-domain.com

# Migration control
RUN_MIGRATIONS=false
```

### 2. CORS Configuration

The backend CORS settings are configured through:
1. **Environment variable**: `CORS_ORIGIN` in `.env.*` files
2. **betterAuth trustedOrigins**: Automatically uses `CORS_ORIGIN` from env
3. **Express CORS middleware**: Uses `CORS_ORIGIN` from `apps/raqeem-backend/src/app.ts:18`

Make sure all three are aligned for proper authentication to work.

## Deployment

### Production Deployment

```bash
# 1. Update .env.production with actual values
cd raqeem-deployment
nano .env.production

# 2. Deploy the stack
./deploy-production.sh

# 3. Run migrations (first time only or when schema changes)
./migrate-production.sh

# 4. Monitor deployment
docker stack services raqeem-production
docker service logs raqeem-production_raqeem-backend -f
```

### Staging Deployment

```bash
# 1. Update .env.staging
cd raqeem-deployment
nano .env.staging

# 2. Deploy
./deploy-staging.sh

# 3. Run migrations if needed
./migrate-staging.sh
```

### Development Deployment

```bash
# 1. Update .env.develop
cd raqeem-deployment
nano .env.develop

# 2. Deploy
./deploy-develop.sh

# 3. Run migrations if needed
./migrate-develop.sh
```

## Database Migrations

Migrations are controlled by the `RUN_MIGRATIONS` environment variable and only run when deploying the backend.

### When to Run Migrations

- First deployment (initial database setup)
- After schema changes in the codebase
- When updating to a new version with database changes

### How Migrations Work

1. The backend Dockerfile includes an entrypoint script (`docker-entrypoint.sh`)
2. When `RUN_MIGRATIONS=true`, the script runs `pnpm db:migrate` before starting the server
3. Migrations run using Drizzle Kit's migration system

### Migration Scripts

Each environment has a migration script:
- `./migrate-production.sh` - Runs migrations in production
- `./migrate-staging.sh` - Runs migrations in staging
- `./migrate-develop.sh` - Runs migrations in develop

**Important**: After migrations complete, the script reminds you to disable the flag:
```bash
docker service update --env-add RUN_MIGRATIONS=false raqeem-production_raqeem-backend
```

## Scaling

Scale services by updating replicas in the docker-compose files or using:

```bash
# Scale backend to 3 replicas
docker service scale raqeem-production_raqeem-backend=3

# Scale frontend to 5 replicas
docker service scale raqeem-production_raqeem-frontend=5
```

**Note**: PostgreSQL should remain at 1 replica (manager node) unless you set up replication.

## Monitoring

### View Service Status
```bash
docker stack services raqeem-production
docker stack ps raqeem-production
```

### View Logs
```bash
# Backend logs
docker service logs raqeem-production_raqeem-backend -f

# Frontend logs
docker service logs raqeem-production_raqeem-frontend -f

# Postgres logs
docker service logs raqeem-production_postgres -f
```

### Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready` check every 10s
- **Backend**: HTTP check on port 4000 every 30s
- **Frontend**: HTTP check on port 3000 every 30s

## Rolling Updates

Docker Swarm handles rolling updates automatically:
- Updates one container at a time (`parallelism: 1`)
- Starts new container before stopping old one (`order: start-first`)
- 10-second delay between updates

To update a service:
```bash
# Rebuild and redeploy
./deploy-production.sh
```

## Rollback

If deployment fails, rollback to previous version:
```bash
docker service rollback raqeem-production_raqeem-backend
docker service rollback raqeem-production_raqeem-frontend
```

## Removing a Stack

To completely remove a deployed stack:
```bash
docker stack rm raqeem-production
docker stack rm raqeem-staging
docker stack rm raqeem-develop
```

**Warning**: This removes all containers but keeps volumes (database data is preserved).

## Volumes and Data Persistence

Each environment has its own PostgreSQL volume:
- `raqeem-production_postgres_data`
- `raqeem-staging_postgres_data`
- `raqeem-develop_postgres_data`

To backup database:
```bash
docker exec $(docker ps -q -f name=raqeem-production_postgres) \
  pg_dump -U raqeem_prod raqeem_production > backup.sql
```

## Troubleshooting

### Backend can't connect to database
- Check PostgreSQL is healthy: `docker service ps raqeem-production_postgres`
- Verify `DATABASE_URL` in environment variables
- Check logs: `docker service logs raqeem-production_postgres -f`

### CORS errors in frontend
- Verify `CORS_ORIGIN` matches your frontend domain
- Check betterAuth `trustedOrigins` in `apps/raqeem-backend/src/lib/auth.ts:17`
- Ensure `BETTER_AUTH_URL` is correctly set

### Migrations fail
- Check database connectivity
- Verify Drizzle config: `apps/raqeem-backend/drizzle.config.ts`
- Review migration logs: `docker service logs raqeem-production_raqeem-backend -f`

### Service won't start
- Check resource constraints
- Review service logs
- Verify image builds successfully locally

## Network Configuration

All services communicate over the `raqeem-network` overlay network. The network is:
- Created per environment (isolated)
- Attachable (can join additional containers)
- Overlay driver (multi-host support)

## Security Notes

1. **Secrets Management**: Consider using Docker Secrets for sensitive data
2. **Database Passwords**: Use strong, unique passwords for each environment
3. **BETTER_AUTH_SECRET**: Generate cryptographically secure random strings (min 32 chars)
4. **Environment Isolation**: Each environment has separate databases and networks
5. **HTTPS**: Configure Traefik or another reverse proxy for SSL/TLS

## CI/CD Integration

For automated deployments, you can:
1. Build images in CI pipeline
2. Push to container registry
3. Update docker-compose to use registry images
4. Run deployment scripts on target servers

Example CI step:
```yaml
- name: Deploy to Production
  run: |
    scp .env.production deploy-production.sh user@server:/app/
    ssh user@server 'cd /app && ./deploy-production.sh'
```
