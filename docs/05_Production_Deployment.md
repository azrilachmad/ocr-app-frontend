# ============================================================================
#  SYNCHRO SCAN - PRODUCTION DEPLOYMENT GUIDE
#  Ubuntu Server + PM2 + Nginx + SSL
# ============================================================================

## Quick Reference

```bash
# SSH to your server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/yourusername/ocr-app-frontend.git /var/www/synchro-scan
cd /var/www/synchro-scan

# Run automated deployment
chmod +x deploy.sh && ./deploy.sh
```

---

## Prerequisites

- Ubuntu 20.04/22.04 LTS server
- Domain name pointing to your server IP
- SSH access with sudo privileges
- Minimum 1GB RAM, 1 vCPU

---

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl git build-essential ufw

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## Step 2: Install Node.js v20 LTS

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

---

## Step 3: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Install log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Step 4: Install & Configure MySQL

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- In MySQL console:
CREATE DATABASE synchro_scan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'synchro_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON synchro_scan.* TO 'synchro_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 5: Clone & Setup Application

```bash
# Create directory and clone
sudo mkdir -p /var/www/synchro-scan
sudo chown -R $USER:$USER /var/www/synchro-scan
git clone https://github.com/yourusername/ocr-app-frontend.git /var/www/synchro-scan
cd /var/www/synchro-scan

# Create logs directory
mkdir -p logs
```

---

## Step 6: Configure Backend

```bash
cd /var/www/synchro-scan/Backend

# Install dependencies
npm install --production

# Create environment file
nano .env
```

**Backend `.env` configuration:**
```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=synchro_scan
DB_USER=synchro_user
DB_PASS=your_strong_password

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_64_character_random_string_here

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS (your production domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

```bash
# Create uploads directory
mkdir -p uploads
```

---

## Step 7: Configure & Build Frontend

```bash
cd /var/www/synchro-scan/Frontend

# Install dependencies
npm install

# Create environment file
nano .env
```

**Frontend `.env` configuration:**
```env
VITE_API_URL=https://yourdomain.com/api
```

```bash
# Build for production
npm run build

# Install serve for static hosting
npm install serve --save-dev
```

---

## Step 8: Start Application with PM2

```bash
cd /var/www/synchro-scan

# Start applications
pm2 start ecosystem.config.json --env production

# View status
pm2 status

# Save process list for auto-restart
pm2 save

# Enable startup script
pm2 startup systemd -u $USER --hp $HOME
# Run the command that PM2 outputs
```

**PM2 Commands Cheatsheet:**
```bash
pm2 status              # Check status
pm2 logs                # View all logs
pm2 logs backend        # View backend logs only
pm2 restart all         # Restart all apps
pm2 reload all          # Zero-downtime reload
pm2 stop all            # Stop all apps
pm2 monit               # Real-time monitoring
pm2 flush               # Clear all logs
```

---

## Step 9: Install & Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Copy configuration
sudo cp /var/www/synchro-scan/nginx.conf.example /etc/nginx/sites-available/synchro-scan

# Edit configuration with your domain
sudo nano /etc/nginx/sites-available/synchro-scan
# Replace 'yourdomain.com' with your actual domain

# Enable site
sudo ln -sf /etc/nginx/sites-available/synchro-scan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 10: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 11: Verify Deployment

```bash
# Check all services
systemctl status nginx
systemctl status mysql
pm2 status

# Test endpoints
curl -I https://yourdomain.com
curl https://yourdomain.com/api/health

# Check logs if needed
pm2 logs synchro-scan-backend --lines 50
sudo tail -f /var/log/nginx/error.log
```

---

## Updating Application

```bash
cd /var/www/synchro-scan

# Pull latest changes
git pull origin main

# Backend update
cd Backend && npm install --production && cd ..

# Frontend update
cd Frontend && npm install && npm run build && cd ..

# Reload applications (zero-downtime)
pm2 reload all
```

---

## Troubleshooting

### Application not starting
```bash
pm2 logs synchro-scan-backend --lines 100
pm2 describe synchro-scan-backend
```

### Database connection issues
```bash
mysql -u synchro_user -p synchro_scan -e "SELECT 1"
```

### Nginx issues
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Permission issues
```bash
sudo chown -R www-data:www-data /var/www/synchro-scan/Backend/uploads
sudo chmod -R 755 /var/www/synchro-scan
```

---

## Security Recommendations

1. **Firewall**: Only allow ports 22, 80, 443
2. **SSH**: Disable password authentication, use SSH keys
3. **Updates**: Enable automatic security updates
4. **Monitoring**: Setup PM2 monitoring or external service
5. **Backups**: Regular database and uploads backup

```bash
# Enable automatic updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Directory Structure on Server

```
/var/www/synchro-scan/
├── Backend/
│   ├── .env                 # Backend environment
│   ├── server.js            # Entry point
│   ├── src/                 # Source code
│   ├── uploads/             # Uploaded files
│   └── node_modules/
├── Frontend/
│   ├── .env                 # Frontend environment
│   ├── dist/                # Production build
│   └── node_modules/
├── logs/                    # PM2 logs
├── ecosystem.config.json    # PM2 configuration
├── deploy.sh                # Deployment script
└── nginx.conf.example       # Nginx template
```
