#!/bin/bash
set -e

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

# Restart or start PM2 app
if pm2 list | grep -q "Audit"; then
  pm2 restart Audit
else
  pm2 start ecosystem.config.js
fi