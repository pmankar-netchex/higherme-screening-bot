# Simple Docker Commands

## Prerequisites
- Docker installed and running
- Docker Compose installed

## Quick Start

### 1. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Vapi.ai keys
```

### 2. Start with Docker Compose (Easiest)
```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 3. Or use Docker directly
```bash
# Build
docker build -t recruitment-app .

# Run
docker run -d \
  --name recruitment-app \
  -p 3000:3000 \
  --env-file .env.local \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  recruitment-app

# Stop
docker stop recruitment-app
docker rm recruitment-app
```

## Access Application
- **App**: http://localhost:3000
- **Health**: http://localhost:3000/api/health

## Common Commands
```bash
# Rebuild without cache
docker-compose build --no-cache

# View running containers
docker ps

# Check logs
docker logs recruitment-app

# Clean up everything
docker system prune -a
```

That's it! No complex scripts needed.
