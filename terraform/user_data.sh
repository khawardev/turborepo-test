#!/bin/bash
exec > /var/log/${app_name}-deploy.log 2>&1
set -x

# Update system packages
apt-get update -y && apt-get upgrade -y
apt-get install -y git curl unzip

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clean old app files and clone repo
rm -rf /opt/app
git clone ${github_url} /opt/app

cd /opt/app

# Set environment variables
cat > .env.local << EOF
AWS_REGION=${aws_region}
NODE_ENV=production
PORT=3000
DATABASE_URL="${database_url}"
BETTER_AUTH_SECRET="${better_auth_secret}"
BETTER_AUTH_URL="http://audit.humanbrand.ai"
GOOGLE_CLIENT_ID="${google_client_id}"
GOOGLE_CLIENT_SECRET="${google_client_secret}"
NEXT_PUBLIC_APP_URL="http://audit.humanbrand.ai"
EMAIL_USER="${email_user}"
EMAIL_PASS="${email_pass}"
SPIDER_API_KEY="${spider_api_key}"
GOOGLE_GENERATIVE_AI_API_KEY="${google_generative_ai_api_key}"
EOF

# Install deps and build app
npm install
npm run build

# PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'Audit',
    script: 'npm',
    args: 'start',
    cwd: '/opt/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M', // Reduced to 512MB to fit within 2GB RAM
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    exec_mode: 'fork', // Explicitly set to single process mode
    log_date_format: 'YYYY-MM-DD HH:mm:ss', // Adds timestamps to logs
    error_file: '/opt/app/logs/audit-error.log', // Custom error log
    out_file: '/opt/app/logs/audit-out.log', // Custom output log
    combine_logs: false // Separates stdout and stderr
  }]
};
EOF

mkdir -p /opt/app/logs
chmod -R 755 /opt/app/logs

# Set permissions
chown -R ubuntu:ubuntu /opt/app

# Start app with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup --user ubuntu --hp /home/ubuntu

# Auto security updates
apt-get install -y unattended-upgrades
systemctl enable unattended-upgrades
systemctl start unattended-upgrades

echo "Deployment completed"
