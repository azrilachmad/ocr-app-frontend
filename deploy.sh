#!/bin/bash

# =============================================================================
# Synchro Scan - Production Deployment Script for Ubuntu + PM2
# =============================================================================
# Run this script on your Ubuntu server after cloning the repository
# Usage: chmod +x deploy.sh && ./deploy.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Synchro Scan Production Deployment   ${NC}"
echo -e "${BLUE}========================================${NC}"

# =============================================================================
# 1. SYSTEM UPDATE & DEPENDENCIES
# =============================================================================
echo -e "\n${YELLOW}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# =============================================================================
# 2. INSTALL NODE.JS (v20 LTS)
# =============================================================================
echo -e "\n${YELLOW}[2/8] Installing Node.js v20 LTS...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}Node.js version: $(node -v)${NC}"
echo -e "${GREEN}npm version: $(npm -v)${NC}"

# =============================================================================
# 3. INSTALL PM2 GLOBALLY
# =============================================================================
echo -e "\n${YELLOW}[3/8] Installing PM2...${NC}"
sudo npm install -g pm2
pm2 install pm2-logrotate
echo -e "${GREEN}PM2 version: $(pm2 -v)${NC}"

# =============================================================================
# 4. INSTALL MYSQL (Optional - skip if using external DB)
# =============================================================================
echo -e "\n${YELLOW}[4/8] Setting up MySQL...${NC}"
read -p "Install MySQL locally? (y/n): " install_mysql
if [ "$install_mysql" = "y" ]; then
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    echo -e "${GREEN}MySQL installed successfully!${NC}"
    echo -e "${YELLOW}Run 'sudo mysql_secure_installation' to secure your installation${NC}"
    echo -e "${YELLOW}Create database with: CREATE DATABASE synchro_scan;${NC}"
else
    echo -e "${BLUE}Skipping MySQL installation...${NC}"
fi

# =============================================================================
# 5. SETUP BACKEND
# =============================================================================
echo -e "\n${YELLOW}[5/8] Setting up Backend...${NC}"
cd Backend

# Install dependencies
npm install --production

# Create .env file if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=synchro_scan
DB_USER=your_db_user
DB_PASS=your_db_password

# JWT Configuration (Generate with: openssl rand -hex 32)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Gemini API Key (configured per-user in Settings page)
# GEMINI_API_KEY=your_gemini_api_key
EOF
    echo -e "${RED}IMPORTANT: Edit Backend/.env with your actual credentials!${NC}"
fi

# Create necessary directories
mkdir -p uploads logs

cd ..

# =============================================================================
# 6. SETUP FRONTEND
# =============================================================================
echo -e "\n${YELLOW}[6/8] Setting up Frontend...${NC}"
cd Frontend

# Install dependencies
npm install

# Create .env file for production build
if [ ! -f .env ]; then
    cat > .env << 'EOF'
VITE_API_URL=https://api.yourdomain.com
EOF
    echo -e "${RED}IMPORTANT: Edit Frontend/.env with your API URL!${NC}"
fi

# Build for production
echo -e "${YELLOW}Building frontend for production...${NC}"
npm run build

# Install serve for static file serving
npm install serve --save-dev

cd ..

# =============================================================================
# 7. CREATE LOGS DIRECTORY
# =============================================================================
echo -e "\n${YELLOW}[7/8] Creating logs directory...${NC}"
mkdir -p logs

# =============================================================================
# 8. START WITH PM2
# =============================================================================
echo -e "\n${YELLOW}[8/8] Starting applications with PM2...${NC}"

# Stop existing processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start using ecosystem config
pm2 start ecosystem.config.json --env production

# Save PM2 process list
pm2 save

# Setup PM2 to restart on system boot
pm2 startup systemd -u $USER --hp $HOME

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}       Deployment Complete!            ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}PM2 Status:${NC}"
pm2 status
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit Backend/.env with your database credentials"
echo "2. Edit Frontend/.env with your API URL"
echo "3. Rebuild frontend: cd Frontend && npm run build"
echo "4. Configure Nginx (see nginx.conf.example)"
echo "5. Setup SSL with: sudo certbot --nginx -d yourdomain.com"
echo ""
echo -e "${BLUE}Useful PM2 Commands:${NC}"
echo "  pm2 status          - Check app status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all apps"
echo "  pm2 reload all      - Zero-downtime reload"
echo "  pm2 monit           - Monitor apps"
