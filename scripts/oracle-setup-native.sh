#!/usr/bin/env bash
# Setup SIN Docker para Oracle VM (~1 GB RAM)
# Ejecutar en la VM: bash scripts/oracle-setup-native.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/chiro-app}"
CERT_DIR="/etc/mosquitto/certs"

echo "==> Swap 1 GB (ayuda en VMs chicas)..."
if ! swapon --show | grep -q swapfile; then
  sudo fallocate -l 1G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "==> Paquetes base..."
sudo apt-get update -qq
sudo apt-get install -y git curl openssl mosquitto mosquitto-clients

echo "==> Node.js 20..."
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Repo..."
if [ ! -d "$APP_DIR" ]; then
  git clone https://github.com/gtala/chiro-app.git "$APP_DIR"
fi
cd "$APP_DIR"
git pull origin main 2>/dev/null || true

echo "==> Certificados MQTTS..."
chmod +x scripts/generate-certs.sh
sudo mkdir -p "$CERT_DIR"
if [ ! -f "$CERT_DIR/ca.crt" ]; then
  ./scripts/generate-certs.sh /tmp/mosquitto-certs
  sudo cp /tmp/mosquitto-certs/* "$CERT_DIR/"
  sudo chmod 644 "$CERT_DIR"/*.crt
  sudo chmod 600 "$CERT_DIR"/*.key
fi

echo "==> Mosquitto config..."
sudo cp deploy/mosquitto.conf /etc/mosquitto/conf.d/chiro.conf
sudo systemctl enable mosquitto
sudo systemctl restart mosquitto

echo "==> Backend .env..."
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo ""
  echo "EDITÁ backend/.env con password Atlas y volvé a correr este script."
  exit 1
fi

# Asegurar vars para instalación nativa
grep -q '^MQTT_HOST=' backend/.env && sed -i 's|^MQTT_HOST=.*|MQTT_HOST=localhost|' backend/.env || echo 'MQTT_HOST=localhost' >> backend/.env
grep -q '^MQTT_TLS_INSECURE=' backend/.env || echo 'MQTT_TLS_INSECURE=true' >> backend/.env
grep -q '^MQTT_CA_PATH=' backend/.env && sed -i "s|^MQTT_CA_PATH=.*|MQTT_CA_PATH=$CERT_DIR/ca.crt|" backend/.env || echo "MQTT_CA_PATH=$CERT_DIR/ca.crt" >> backend/.env
grep -q '^API_HOST=' backend/.env && sed -i 's|^API_HOST=.*|API_HOST=0.0.0.0|' backend/.env || echo 'API_HOST=0.0.0.0' >> backend/.env

echo "==> npm install (solo producción)..."
cd backend
npm ci --omit=dev
cd ..

echo "==> systemd backend..."
sudo cp deploy/chiro-backend.service /etc/systemd/system/
sudo sed -i "s|/home/ubuntu/chiro-app|$APP_DIR|g" /etc/systemd/system/chiro-backend.service
sudo systemctl daemon-reload
sudo systemctl enable chiro-backend
sudo systemctl restart chiro-backend

sleep 3
echo ""
echo "==> Estado:"
sudo systemctl is-active mosquitto && echo "Mosquitto: OK" || echo "Mosquitto: FALLO"
sudo systemctl is-active chiro-backend && echo "Backend: OK" || echo "Backend: FALLO"
curl -sf http://localhost:3000/status && echo "" || echo "API aún no responde — ver: journalctl -u chiro-backend -f"

echo ""
echo "Listo (sin Docker). Puertos: 3000 API, 8883 MQTTS"
echo "Logs: journalctl -u chiro-backend -f"
