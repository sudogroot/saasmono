# Raqeem Infrastructure

Infrastructure as Code for Raqeem deployment using Docker Swarm and Traefik.

## Structure

```
infra/
├── traefik/
│   ├── docker-compose.yml         # Traefik reverse proxy
│   ├── traefik.yml                # Traefik static configuration
│   └── deploy.sh                  # Deploy Traefik
├── raqeem/
│   ├── production/
│   │   ├── docker-compose.yml     # Production stack
│   │   ├── .env                   # Production config
│   │   └── deploy.sh              # Deploy production
│   ├── staging/
│   │   ├── docker-compose.yml     # Staging stack
│   │   ├── .env                   # Staging config
│   │   └── deploy.sh              # Deploy staging
│   └── develop/
│       ├── docker-compose.yml     # Development stack
│       ├── .env                   # Development config
│       └── deploy.sh              # Deploy development
└── secrets/
    ├── setup-secrets-production.sh
    ├── setup-secrets-staging.sh
    └── setup-secrets-develop.sh
```

## Prerequisites

1. Docker Swarm initialized
2. Docker registry accessible
3. Secrets created for each environment
4. `/opt/projects/raqeem/` directories created

## Quick Start

### 1. Setup Secrets

```bash
cd secrets
./setup-secrets-production.sh
```

### 2. Deploy Traefik

```bash
cd traefik
./deploy.sh
```

### 3. Deploy Raqeem

```bash
cd raqeem/production
./deploy.sh
```

## Environment Variables

Each environment requires:

- `DOCKER_REGISTRY` - Your Docker registry URL
- `IMAGE_TAG` - Image tag to deploy (default: environment name)
- `CORS_ORIGIN` - Frontend URL for CORS
- `BETTER_AUTH_URL` - Backend URL for auth
- `NEXT_PUBLIC_SERVER_URL` - Backend URL for frontend
- `BACKEND_DOMAIN` - Domain for backend (Traefik routing)
- `FRONTEND_DOMAIN` - Domain for frontend (Traefik routing)

## Updating Deployment

When new images are pushed to the registry:

```bash
cd raqeem/production
./deploy.sh
```

This will pull the latest images and perform a rolling update.

## Secrets Management

Secrets are managed via Docker Swarm secrets. See the main Raqeem repo `raqeem-deployment/SECRETS.md` for details.
