#!/bin/bash
set -e
exec > /opt/app/logs/deploy.log 2>&1

APP_DIR="/opt/app"
cd "$APP_DIR"

# Ensure logs directory exists and set permissions
mkdir -p logs
chmod -R 755 logs

# Set ownership
chown -R ubuntu:ubuntu "$APP_DIR"

# Install dependencies and build
npm install
npm run build

# Kill process using port 3000
sudo fuser -k 3000/tcp || true

pm2 restart Audit
