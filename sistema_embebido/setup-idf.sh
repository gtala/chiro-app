#!/usr/bin/env bash
# Instala ESP-IDF 4.4.7 + esp-idf-lib (BMP280) y sincroniza certificados MQTTS.
set -euo pipefail

IDF_VERSION="${IDF_VERSION:-v4.4.7}"
ESP_DIR="${ESP_DIR:-$HOME/esp}"
IDF_PATH="${IDF_PATH:-$ESP_DIR/esp-idf}"
LIB_PATH="${IDF_PATH}/../esp-idf-lib"

echo "==> ESP-IDF en $IDF_PATH"
if [ ! -d "$IDF_PATH" ]; then
  mkdir -p "$ESP_DIR"
  git clone -b "$IDF_VERSION" --recursive https://github.com/espressif/esp-idf.git "$IDF_PATH"
fi

if [ ! -d "$LIB_PATH" ]; then
  git clone https://github.com/UncleRus/esp-idf-lib.git "$LIB_PATH"
fi

# Certificado CA del broker (Oracle / docker-compose)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cp "$ROOT/mosquitto/certs/ca.crt" "$(dirname "$0")/main/broker_CA.crt"
echo "==> broker_CA.crt actualizado"

cd "$(dirname "$0")"
. "$IDF_PATH/export.sh"
idf.py set-target esp32
idf.py build
echo ""
echo "Listo. Flashear con: idf.py -p /dev/ttyUSB0 flash monitor"
echo "WiFi: editar sdkconfig.defaults o idf.py menuconfig"
