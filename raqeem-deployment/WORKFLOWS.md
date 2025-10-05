# Raqeem Deployment Workflows

This document explains the different deployment workflows for Raqeem.

## Overview

There are two main deployment modes:

1. **Local Mode** - Build and deploy locally for testing
2. **Registry Mode** - Build, push to registry, then deploy from registry (production workflow)

## Local Development Workflow

Use this for local testing before pushing to production.

### Quick Start

```bash
cd raqeem-deployment
./deploy-local.sh
```

This will:
- Build images locally
- Use file-based secrets (auto-created in `secrets/` directory)
- Deploy with Docker Compose (not Swarm)
- Expose services on localhost:
  - Frontend: http://localhost:4001
  - Backend: http://localhost:4000

### Stopping Local Deployment

```bash
docker compose -f raqeem-deployment/docker-compose.local.yml down
```

### Running Migrations Locally

```bash
docker compose -f raqeem-deployment/docker-compose.local.yml exec raqeem-backend pnpm db:migrate
```

## Production Workflow (Registry Mode)

This is the recommended workflow for staging and production deployments.

### Step 1: Build and Push to Registry

From your development machine:

```bash
cd raqeem-deployment

# Set your registry URL
export DOCKER_REGISTRY=registry.example.com/

# Build and push production images
./build-production.sh

# Or for staging
./build-staging.sh

# Or for develop
./build-develop.sh
```

This will:
- Build both frontend and backend images
- Tag them with timestamp and environment name
- Push to your Docker registry

### Step 2: Deploy from Registry

On your server (or via SSH):

```bash
cd raqeem-deployment

# Make sure .env.production has DOCKER_REGISTRY set
# DOCKER_REGISTRY=registry.example.com/
# IMAGE_TAG=production (or specific timestamp tag)

./deploy-production.sh
```

This will:
- Pull images from registry
- Deploy to Docker Swarm
- Perform rolling update

### Updating Deployment

When you push new images to the registry:

```bash
# On dev machine: build and push
./build-production.sh

# On server: redeploy (pulls latest images)
./deploy-production.sh
```

Docker Swarm will perform a rolling update with zero downtime.

## Environment Configuration

### Local Mode (.env.local)

```bash
CORS_ORIGIN=http://localhost:4001
BETTER_AUTH_URL=http://localhost:4000
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
RUN_MIGRATIONS=false
```

No `DOCKER_REGISTRY` needed - builds locally.

### Registry Mode (.env.production, .env.staging, .env.develop)

```bash
# Registry configuration
DOCKER_REGISTRY=registry.example.com/
IMAGE_TAG=production

# Application URLs
CORS_ORIGIN=https://app.example.com
BETTER_AUTH_URL=https://api.example.com
NEXT_PUBLIC_SERVER_URL=https://api.example.com

# Traefik domains
BACKEND_DOMAIN=api.example.com
FRONTEND_DOMAIN=app.example.com

RUN_MIGRATIONS=false
```

**If `DOCKER_REGISTRY` is set:** Deploy scripts pull from registry
**If `DOCKER_REGISTRY` is empty:** Deploy scripts build locally

## Secrets Management

### Local Mode

Secrets are stored in `raqeem-deployment/secrets/` as plain text files (gitignored).

Auto-created on first run with default values.

### Registry Mode (Docker Swarm)

Secrets are managed via Docker Swarm secrets:

```bash
# Create secrets (one time)
cd raqeem-deployment
./setup-secrets-production.sh

# Deploy
./deploy-production.sh
```

See [SECRETS.md](./SECRETS.md) for details.

## CI/CD Integration

### Example GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push images
        env:
          DOCKER_REGISTRY: ${{ secrets.DOCKER_REGISTRY }}
          NEXT_PUBLIC_SERVER_URL: ${{ secrets.NEXT_PUBLIC_SERVER_URL }}
        run: |
          cd raqeem-deployment
          docker login $DOCKER_REGISTRY -u ${{ secrets.REGISTRY_USER }} -p ${{ secrets.REGISTRY_PASSWORD }}
          ./build-production.sh

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/infra-repo/raqeem/production
            ./deploy.sh
```

## Troubleshooting

### Images not updating

If you're pulling from registry but not seeing updates:

```bash
# Force pull latest images
docker pull registry.example.com/raqeem-backend:production
docker pull registry.example.com/raqeem-frontend:production

# Redeploy
./deploy-production.sh
```

### Registry authentication

```bash
docker login registry.example.com
# Enter credentials
```

### Local mode not working

```bash
# Clean up and restart
docker compose -f raqeem-deployment/docker-compose.local.yml down -v
rm -rf raqeem-deployment/secrets
./deploy-local.sh
```

## Quick Reference

| Task | Command |
|------|---------|
| Test locally | `./deploy-local.sh` |
| Build for production | `./build-production.sh` |
| Deploy production | `./deploy-production.sh` |
| View logs | `docker service logs raqeem-production_raqeem-backend -f` |
| Check status | `docker stack services raqeem-production` |
| Run migrations | `./migrate-production.sh` |
| Update secrets | `./remove-secrets-production.sh && ./setup-secrets-production.sh` |

## Best Practices

1. **Always test locally first** with `deploy-local.sh`
2. **Use registry mode for production** - never build on production servers
3. **Tag images with timestamps** for rollback capability
4. **Keep registry credentials secure** - use Docker secrets or CI/CD secrets
5. **Test in staging** before deploying to production
6. **Monitor deployments** - check service status after deployment
7. **Use rolling updates** - Docker Swarm handles this automatically
