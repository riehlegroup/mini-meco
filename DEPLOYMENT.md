# Mini-Meco Deployment Guide

This guide covers production deployment using Docker.

## Table of Contents
- [Production Deployment](#production-deployment)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
  - [Port Mapping](#port-mapping)
  - [Updating the Application](#updating-the-application)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
---

## Production Deployment

Production deployment uses Docker Compose to orchestrate the application containers.

### Prerequisites
- Docker 20.10 or higher
- Docker Compose 2.0 or higher

### Initial Setup

1. **Clone the repository on your server:**
   ```bash
   git clone <repository-url>
   cd mini-meco
   ```

2. **Create production environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your production values:**
   ```bash
   nano .env
   ```

   Update the following variables:
   ```env
   # Production URLs - update with your domain
   CLIENT_URL=https://your-domain.com
   VITE_API_URL=https://your-domain.com:3000

   # Database path (leave as-is for Docker)
   DB_PATH=/app/server/data/myDatabase.db

   # Generate a strong random secret
   JWT_SECRET=your_secure_random_jwt_secret_here

   # Your FAU email credentials
   EMAIL_USER_FAU=your.email@fau.de
   EMAIL_PASS_FAU=your_secure_password

   # Optional: GitHub token for code activity
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```

4. **Build and start the containers:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the server and client Docker images
   - Create a named volume for the database
   - Start both containers in detached mode
   - Make the application available on port 80

5. **Verify deployment:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

6. **Access the application:**
   - Frontend: https://happy.uni1.de
   - Backend API: https://happy.uni1.de:3000

### Port Mapping

By default, Docker Compose exposes:
- Port **80** for the frontend (nginx)
- Port **3000** for the backend API

**To map different host ports**, edit `docker-compose.yml`:

```yaml
services:
  server:
    ports:
      - "8080:3000"  # Map host port 8080 to container port 3000

  client:
    ports:
      - "8000:80"    # Map host port 8000 to container port 80
```

### Updating the Application

1. **Pull latest code:**
   ```bash
   git pull
   ```

2. **Rebuild and restart containers:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

   The database persists in the Docker volume, so your data is safe across updates.

---

## Environment Variables

### Server Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Set to `production` for production deployment |
| `PORT` | No | `3000` | Port for the backend server |
| `CLIENT_URL` | No | `http://localhost:5173` | Frontend URL for CORS and email links |
| `DB_PATH` | No | `./myDatabase.db` | Path to SQLite database file |
| `JWT_SECRET` | **Yes** | `your_jwt_secret` | Secret key for JWT token signing (use strong random value in production!) |
| `EMAIL_USER_FAU` | Production | - | FAU email username for sending emails |
| `EMAIL_PASS_FAU` | Production | - | FAU email password |

### Client Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000` | Backend API base URL |
| `VITE_GITHUB_TOKEN` | Optional | - | GitHub personal access token for code activity features |

### Email Behavior

- **Development** (`NODE_ENV !== 'production'`): Emails are logged to console, not sent
- **Production** (`NODE_ENV === 'production'`): Emails are sent via FAU SMTP server

---

## Database Management

The SQLite database is stored in a Docker named volume for easy backup and portability.

### Backup Database

**Method 1: Copy from running container**
```bash
docker cp mini-meco-server-1:/app/server/data/myDatabase.db ./backup-$(date +%Y%m%d-%H%M%S).db
```

**Method 2: Export via docker-compose**
```bash
docker-compose exec server cat /app/server/data/myDatabase.db > ./backup-$(date +%Y%m%d-%H%M%S).db
```

### Restore Database

1. **Stop the containers:**
   ```bash
   docker-compose down
   ```

2. **Copy backup to volume:**
   ```bash
   docker run --rm -v mini-meco-db:/app/server/data -v $(pwd):/backup alpine cp /backup/backup-YYYYMMDD-HHMMSS.db /app/server/data/myDatabase.db
   ```

3. **Restart containers:**
   ```bash
   docker-compose up -d
   ```

### Inspect Volume

```bash
# Show volume details
docker volume inspect mini-meco-db

# Show volume location on host
docker volume inspect mini-meco-db | grep Mountpoint
```

### Manual Database Access

```bash
# Access SQLite database interactively
docker-compose exec server sh
cd /app/server/data
sqlite3 myDatabase.db
```

---

## Common Commands

### Production Deployment

```bash
# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f server
docker-compose logs -f client

# Check container status
docker-compose ps

# Restart services
docker-compose restart

# Rebuild and restart after code changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Maintenance

```bash
# Check resource usage
docker stats

# Remove stopped containers
docker-compose down --remove-orphans

# Remove old images (be careful!)
docker image prune -a

# View volume list
docker volume ls
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs server
docker-compose logs client
```

**Common issues:**
- Port 80 or 3000 already in use: Stop other services using these ports
- Environment variables missing: Check `.env` file exists and has correct values
- Build errors: Try `docker-compose build --no-cache`

### Database Issues

**Database not persisting:**
```bash
# Verify volume exists
docker volume ls | grep mini-meco-db

# Inspect volume
docker volume inspect mini-meco-db
```

**Database corruption:**
```bash
# Restore from backup (see Database Management section)
```

### Email Not Sending (Production)

**Check configuration:**
1. Verify `NODE_ENV=production` in `.env`
2. Verify `EMAIL_USER_FAU` and `EMAIL_PASS_FAU` are correct
3. Check server logs for SMTP errors:
   ```bash
   docker-compose logs -f server
   ```

**Test email credentials:**
- Ensure account has SMTP access enabled

### Frontend Can't Connect to Backend

**Check network connectivity:**
```bash
# From inside client container
docker-compose exec client ping server

# From host
curl http://localhost:3000
```

**Check CORS configuration:**
- Verify `CLIENT_URL` in server environment matches frontend URL
- Check browser console for CORS errors

### Build Failures

**Clean rebuild:**
```bash
# Remove all containers and images
docker-compose down
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

**Node modules issues:**
```bash
# On host machine
rm -rf node_modules client/node_modules server/node_modules
npm install

# Then rebuild Docker
docker-compose build --no-cache
```

### Permission Errors

**Database permissions:**
```bash
docker-compose exec server ls -la /app/data/
docker-compose exec server chmod 644 /app/data/myDatabase.db
```

### View Container Internals

```bash
# Access server container shell
docker-compose exec server sh

# Access client container shell
docker-compose exec client sh

# View server files
docker-compose exec server ls -la /app

# View nginx config
docker-compose exec client cat /etc/nginx/conf.d/default.conf
```
---