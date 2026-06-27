#!/usr/bin/env sh
# Setup inicial en Oracle VM (Ubuntu). Ejecutar EN LA VM después de SSH.
set -eu

echo "==> Instalando Docker..."
sudo apt-get update -qq
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker "$USER"

echo "==> Clonando repo..."
if [ ! -d chiro-app ]; then
  git clone https://github.com/gtala/chiro-app.git
fi
cd chiro-app

echo "==> Certificados MQTTS..."
chmod +x scripts/generate-certs.sh
./scripts/generate-certs.sh ./mosquitto/certs

if [ ! -f backend/.env ]; then
  echo ""
  echo "IMPORTANTE: Creá backend/.env con credenciales Atlas antes de continuar."
  echo "  cp backend/.env.example backend/.env && nano backend/.env"
  exit 1
fi

echo "==> Levantando backend + Mosquitto..."
docker compose -f docker-compose.prod.yml up -d --build

sleep 15
curl -sf http://localhost:3000/status && echo "" && echo "Backend OK en puerto 3000"

echo ""
echo "Listo. Probá desde afuera:"
echo "  curl http://TU_IP_PUBLICA:3000/status"
echo "  curl http://TU_IP_PUBLICA:3000/dispositivos"
