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