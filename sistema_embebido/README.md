# ESP32 + BMP280 → Mosquitto MQTTS (Oracle Cloud)

Firmware en `main/app_main.c`: lee temperatura del BMP280 (I2C SDA=21, SCL=22) y publica cada 20 s en `/PLANTA_BAJA/TEMPERATURA`.

## Broker (producción)

```
mqtts://129.151.116.139:8883
```

Certificado CA embebido: `main/broker_CA.crt` (copia de `mosquitto/certs/ca.crt`).

## Requisitos

1. **ESP-IDF v4.4.7** — [Instalación](https://docs.espressif.com/projects/esp-idf/en/v4.4.7/esp32/get-started/index.html)
2. **esp-idf-lib** (driver BMP280) — clon en `../esp-idf-lib` respecto a `esp-idf`
3. Extensión **ESP-IDF** en VS Code (opcional)

Instalación automática (Linux/macOS):

```bash
cd sistema_embebido
chmod +x setup-idf.sh
./setup-idf.sh
```

O manualmente:

```bash
# Desde la raíz del repo
./scripts/sync-esp32-certs.sh

cd sistema_embebido
. ~/esp/esp-idf/export.sh
idf.py set-target esp32
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor
```

## WiFi

Editar `sdkconfig.defaults` (SSID/password) o `idf.py menuconfig` → **Example Connection Configuration**.

## Cableado BMP280 → ESP32

| BMP280 | ESP32 |
|--------|-------|
| VCC    | 3.3V  |
| GND    | GND   |
| SDA    | GPIO 21 |
| SCL    | GPIO 22 |

## JSON publicado

```json
{
  "dispositivoId": 1,
  "nombre": "ESP32_BMP280_TEMPERATURA",
  "ubicacion": "Planta Baja",
  "temperatura": 22.89
}
```

## Configuración SSID y PASS WiFi (VS Code)

Este ejemplo usa la funcion "example_connect()" de la plataforma ESP-IDF.

Para configurar el SSID y PASSWORD se puede usar el icono "engranaje" (configuración)
de la barra inferior del VSCode y allí en la sección de WiFi se podrán configurar los datos
necesarios.

## Certificados

El broker en Oracle usa los certificados de `mosquitto/certs/`. Para actualizar el ESP32:

```bash
./scripts/sync-esp32-certs.sh
```

Regenerar certificados (incluye IP pública Oracle en SAN):

```bash
FORCE_REGEN=1 BROKER_PUBLIC_IP=129.151.116.139 ./scripts/generate-certs.sh ./mosquitto/certs
```

## libreria BMP280

Instalar esp-idf-lib en `../esp-idf-lib` respecto a ESP-IDF. En `CMakeLists.txt`:

```cmake
set(EXTRA_COMPONENT_DIRS $ENV{IDF_PATH}/examples/common_components/protocol_examples_common $ENV{IDF_PATH}/../esp-idf-lib/components/)
```

