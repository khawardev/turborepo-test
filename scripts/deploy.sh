#!/bin/bash

APP_DIR="/opt/app/"
cd "$APP_DIR" || exit 1

npm install || exit 1
npm run build || exit 1

pm2 restart Audit || exit 1

exit 0