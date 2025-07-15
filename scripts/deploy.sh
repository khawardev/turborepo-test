#!/bin/bash
set -e

APP_DIR="/opt/app"
cd "$APP_DIR"

# Ensure proper ownership
chown -R ubuntu:ubuntu "$APP_DIR"

# Install and build
npm install
npm run build

# Restart PM2 app
pm2 restart Audit