# Raqeem Deployment

This directory contains all deployment configurations and scripts for deploying Raqeem (frontend + backend) to Docker Swarm across multiple environments.

## 📁 Directory Structure

```
raqeem-deployment/
├── README.md                      # This file
├── DEPLOYMENT.md                  # Detailed deployment guide
├── SECRETS.md                     # Docker Swarm secrets guide
├── docker-compose.production.yml  # Production stack configuration
├── docker-compose.staging.yml     # Staging stack configuration
├── docker-compose.develop.yml     # Development stack configuration
├── .env.production                # Production environment variables (non-secrets)
├── .env.staging                   # Staging environment variables (non-secrets)
├── .env.develop                   # Development environment variables (non-secrets)
├── secrets-production.env         # Production secrets (gitignored!)
├── secrets-staging.env            # Staging secrets (gitignored!)
├── secrets-develop.env            # Development secrets (gitignored!)
├── setup-secrets-production.sh    # Create production Docker secrets
├── setup-secrets-staging.sh       # Create staging Docker secrets
├── setup-secrets-develop.sh       # Create development Docker secrets
├── remove-secrets-production.sh   # Remove production Docker secrets
├── remove-secrets-staging.sh      # Remove staging Docker secrets
├── remove-secrets-develop.sh      # Remove development Docker secrets
├── deploy-production.sh           # Deploy to production
├── deploy-staging.sh              # Deploy to staging
├── deploy-develop.sh              # Deploy to development
├── migrate-production.sh          # Run production migrations
├── migrate-staging.sh             # Run staging migrations
└── migrate-develop.sh             # Run development migrations
```

## 🚀 Quick Start

### Local Development

```bash
cd raqeem-deployment
./deploy-local.sh
```

Services available at:
- Frontend: http://localhost:4001
- Backend: http://localhost:4000

### Production Deployment

**Step 1: Build and push to registry**

```bash
cd raqeem-deployment
export DOCKER_REGISTRY=registry.example.com/
./build-production.sh
```

**Step 2: Configure environment**

```bash
# Update registry URL and domains
nano .env.production
```

**Step 3: Setup secrets (first time only)**

```bash
nano secrets-production.env
./setup-secrets-production.sh
```

**Step 4: Deploy**

```bash
./deploy-production.sh
```

**Step 5: Run migrations (first time only)**

```bash
./migrate-production.sh
```

See **[WORKFLOWS.md](./WORKFLOWS.md)** for detailed workflows.

## 📖 Documentation

- **[WORKFLOWS.md](./WORKFLOWS.md)** - Deployment workflows (local vs registry)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[SECRETS.md](./SECRETS.md)** - Docker Swarm secrets management guide

## 📍 Volume Paths

All data is stored under `/opt/projects/raqeem/` on the server:

- **Production:** `/opt/projects/raqeem/production/postgres-data`
- **Staging:** `/opt/projects/raqeem/staging/postgres-data`
- **Development:** `/opt/projects/raqeem/develop/postgres-data`

These directories will be created automatically during deployment.

## 🔑 Key Features

- ✅ Multi-environment support (production, staging, development)
- ✅ **Docker Swarm secrets** for secure credential management
- ✅ PostgreSQL database with persistent volumes at `/opt/projects/raqeem`
- ✅ Automated database migrations
- ✅ CORS configuration for betterAuth
- ✅ Health checks for all services
- ✅ Rolling updates with zero downtime
- ✅ Docker Swarm orchestration
- ✅ Traefik-ready labels for SSL/TLS

## ⚠️ Important Notes

1. **Never commit `secrets-*.env` files** - They are gitignored and contain sensitive credentials
2. **Use Docker Swarm secrets** - All sensitive data (passwords, keys) are stored as Docker secrets
3. **Run migrations separately** - Use the migration scripts, don't set `RUN_MIGRATIONS=true` in env files
4. **Update all secrets** - Generate strong, random passwords (32+ characters)
5. **Verify CORS settings** - Ensure frontend and backend URLs match across all configs
6. **Volume paths** - All data stored under `/opt/projects/raqeem/`

## 🛠️ Requirements

- Docker 20.10+
- Docker Swarm initialized
- pnpm 10.16.1+
- Node.js 22+

## 📞 Support

For issues or questions, refer to the main project documentation or [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.
