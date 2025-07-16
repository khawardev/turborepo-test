#!/bin/bash
set -e
exec > /opt/app/logs/deploy.log 2>&1

APP_DIR="/opt/app"
cd "$APP_DIR"

# Ensure logs directory exists and set permissions
mkdir -p logs
sudo chmod -R 755 logs
sudo chown -R ubuntu:ubuntu "$APP_DIR"

# Kill process using port 3000
sudo fuser -k 3000/tcp || true

# Install dependencies and build
npm install
npm run build

# Remove .next cache
rm -rf .next/cache

# Create or update Systemd service file
cat << EOF | sudo tee /etc/systemd/system/audit.service
[Unit]
Description=Next.js Audit App
After=network.target

[Service]
ExecStart=/usr/bin/npm start
WorkingDirectory=$APP_DIR
Restart=always
User=ubuntu
Environment=NODE_ENV=production
StandardOutput=append:/opt/app/logs/audit.log
StandardError=append:/opt/app/logs/audit-error.log

[Install]
WantedBy=multi-user.target
EOF

# Reload Systemd, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable audit.service
sudo systemctl restart audit.service