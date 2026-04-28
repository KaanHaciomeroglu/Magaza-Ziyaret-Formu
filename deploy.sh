#!/bin/bash
set -e

UPDATE_FRONTEND=${1:-"true"}
UPDATE_BACKEND=${2:-"true"}

APP_DIR=/DATA/Apps/Magaza_Ziyaret_Formu

# JWT_SECRET kontrolü — önce ortam değişkenine bak, yoksa .env dosyasını oku
if [ -z "$JWT_SECRET" ] && [ -f "$APP_DIR/backend/.env" ]; then
  export $(grep -v '^#' "$APP_DIR/backend/.env" | xargs)
fi

if [ -z "$JWT_SECRET" ]; then
  echo "HATA: JWT_SECRET tanımlı değil."
  echo "Çözüm: $APP_DIR/backend/.env dosyası oluşturun:"
  echo "  echo 'JWT_SECRET=gizli_deger' > $APP_DIR/backend/.env"
  exit 1
fi

if [ "$UPDATE_FRONTEND" = "true" ]; then
  echo "=== Magaza Frontend build ediliyor ==="
  cd "$APP_DIR/hrbp-app"
  rm -rf node_modules package-lock.json
  npm install
  npm run build
fi

if [ "$UPDATE_BACKEND" = "true" ]; then
  echo "=== Magaza Backend güncelleniyor ==="

  if ! command -v pm2 &> /dev/null; then
    echo "pm2 bulunamadı, kuruluyor..."
    npm install -g pm2
  fi

  cd "$APP_DIR/backend"
  rm -rf node_modules package-lock.json
  npm install --omit=dev

  if [ ! -f "$APP_DIR/backend/hrbp.sqlite" ]; then
    echo "=== Veritabanı seed ediliyor ==="
    JWT_SECRET="$JWT_SECRET" node seed.js
  fi

  # ecosystem.config.js oluştur (JWT_SECRET'ı pm2'ye iletmek için)
  cat > "$APP_DIR/backend/ecosystem.config.js" << ECOSYSTEM
module.exports = {
  apps: [{
    name: 'magaza-backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      JWT_SECRET: '${JWT_SECRET}',
      PORT: 5000
    }
  }]
};
ECOSYSTEM

  if pm2 list | grep -q "magaza-backend"; then
    pm2 reload ecosystem.config.js
  else
    pm2 start ecosystem.config.js
  fi
  pm2 save
fi

echo "=== Magaza Nginx yeniden başlatılıyor ==="
sudo docker stop magaza-nginx && sudo docker rm magaza-nginx || true
sudo docker run -d \
  --name magaza-nginx \
  --restart unless-stopped \
  --add-host=host-gateway:host-gateway \
  -p 3003:80 \
  -v "$APP_DIR/hrbp-app/dist:/usr/share/nginx/html" \
  -v "$APP_DIR/nginx/default.conf:/etc/nginx/conf.d/default.conf" \
  nginx:alpine

echo "=== Magaza hazır ==="
