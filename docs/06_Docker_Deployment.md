# ============================================================================
#  SYNCHRO SCAN - DOCKER DEPLOYMENT GUIDE
# ============================================================================

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ocr-app-frontend.git
cd ocr-app-frontend

# 2. Copy and configure environment
cp .env.docker.example .env
nano .env  # Edit with your values

# 3. Build and run (development/testing)
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX (Port 80/443)                  │
│                     (Optional: Production)                   │
└─────────────────────┬───────────────────────┬───────────────┘
                      │                       │
                      ▼                       ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│     Frontend (Port 3000)    │   │     Backend (Port 3001)     │
│     React + Nginx           │   │     Node.js + Express       │
└─────────────────────────────┘   └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     MySQL (Port 3306)       │
                                  │     Database                │
                                  └─────────────────────────────┘
```

---

## Configuration

### Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `strongpassword123` |
| `MYSQL_DATABASE` | Database name | `synchro_scan` |
| `MYSQL_USER` | Database user | `synchro_user` |
| `MYSQL_PASSWORD` | Database password | `userpassword123` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your_super_secret...` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com` |
| `VITE_API_BASE_URL` | Frontend API URL | `https://yourdomain.com/api` |

---

## Deployment Modes

### Development (without SSL)

```bash
# Start all services
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - MySQL: localhost:3306
```

### Production (with Nginx + SSL)

```bash
# 1. Update docker/nginx/conf.d/default.conf with your domain

# 2. Place SSL certificates in docker/ssl/
#    - fullchain.pem
#    - privkey.pem

# 3. Start with production profile
docker-compose --profile production up -d

# Access:
# - https://yourdomain.com
```

---

## Common Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Rebuild after code changes
docker-compose build backend
docker-compose build frontend
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Enter container shell
docker exec -it synchro-scan-backend sh
docker exec -it synchro-scan-mysql mysql -u synchro_user -p
```

---

## SSL Setup with Let's Encrypt

```bash
# 1. Install certbot on host
sudo apt install certbot

# 2. Get certificate (stop nginx first)
docker-compose stop nginx
sudo certbot certonly --standalone -d yourdomain.com

# 3. Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/ssl/

# 4. Start nginx
docker-compose --profile production up -d nginx
```

---

## Troubleshooting

### MySQL connection refused
```bash
# Wait for MySQL to be ready
docker-compose logs mysql | tail -20
# Look for "ready for connections"
```

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Verify environment
docker exec synchro-scan-backend env | grep DB
```

### Frontend API errors
```bash
# Verify VITE_API_BASE_URL is correct
# Rebuild frontend after changing env
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## Volumes

| Volume | Purpose |
|--------|---------|
| `mysql_data` | MySQL database files |
| `backend_uploads` | Uploaded document files |

```bash
# Backup MySQL
docker exec synchro-scan-mysql mysqldump -u synchro_user -p synchro_scan > backup.sql

# Backup uploads
docker cp synchro-scan-backend:/app/uploads ./uploads-backup
```
