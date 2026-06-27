# Despliegue en la nube — Chiro App (IoT TP)

Guía para levantar el proyecto **desde cero** en producción:

```
ESP32 ──MQTTS:8883──► Mosquitto (Oracle VM)
                          │
                          ▼
                    Backend Node :3000 ──► MongoDB Atlas
                          ▲
                          │ rewrites HTTP
                    Frontend Next.js (Vercel)
```

Repositorio: [github.com/gtala/chiro-app](https://github.com/gtala/chiro-app)

---

## Requisitos previos

| Componente | Qué necesitás |
|------------|----------------|
| **MongoDB Atlas** | Cuenta free, cluster M0 |
| **Oracle Cloud** | VM Ubuntu 22.04 (1 GB RAM alcanza con setup nativo) |
| **Vercel** | Cuenta, repo conectado a GitHub |
| **ESP32** | ESP-IDF 4.4.7, sensor BMP280, WiFi 2.4 GHz |
| **Local (opcional)** | Docker, Node 20 — para probar antes de subir |

### Puertos que deben estar abiertos (Internet → VM)

| Puerto | Protocolo | Servicio |
|--------|-----------|----------|
| **22** | TCP | SSH |
| **3000** | TCP | Backend API (Node.js) |
| **8883** | TCP | Mosquitto MQTTS (ESP32) |

No hace falta exponer 8084 (WebSocket MQTT) ni MongoDB (Atlas es cloud).

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/gtala/chiro-app.git
cd chiro-app
```

**Recomendación:** probá primero en local con Docker antes de desplegar en la nube.

```bash
cp backend/.env.example backend/.env
# Completar credenciales Atlas (ver sección 2)
./scripts/generate-certs.sh ./mosquitto/certs
docker compose up -d --build
curl http://localhost:3000/status
```

---

## 2. MongoDB Atlas

1. Crear cluster en [mongodb.com/atlas](https://www.mongodb.com/atlas) (M0 free).
2. **Database Access** → usuario (ej. `chirox`) + contraseña segura.
3. **Network Access** → agregar `0.0.0.0/0` (permite conexión desde Oracle/Vercel).  
   En producción estricta podés limitar a la IP pública de la VM.
4. Anotar el host del connection string: `xxxx.mongodb.net`.

### `backend/.env` (Oracle y local)

```env
API_HOST=0.0.0.0
API_PORT=3000

DB_MONGO_USERNAME=chirox
DB_MONGO_PASSWORD=TU_PASSWORD
DB_MONGO_DBNAME=chiro
DB_MONGO_HOST=TU_CLUSTER.mongodb.net
DB_MONGO_PORT=

MQTT_HOST=localhost          # En Oracle nativo
MQTT_PORT=8883
MQTT_TLS_INSECURE=true
MQTT_CA_PATH=/etc/mosquitto/certs/ca.crt   # Oracle nativo
# MQTT_CA_PATH=../mosquitto/certs/ca.crt   # Local Docker

ROUTER_PATH=/home/backend/routers
ENVIRONMENT=prod
```

### Problemas frecuentes — Atlas

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `MongoServerError: bad auth` | Usuario/contraseña incorrectos | Verificar `.env`, caracteres especiales en password |
| `connection timed out` | IP no permitida en Network Access | Agregar IP de la VM o `0.0.0.0/0` |
| Backend arranca pero no guarda logs | MQTT OK, Mongo no | `journalctl -u chiro-backend -f` y buscar errores de Mongoose |

---

## 3. Oracle Cloud VM (Backend + Mosquitto)

### 3.1 Crear la instancia

- **Shape:** VM.Standard.E2.1.Micro (free tier) o similar.
- **OS:** Ubuntu 22.04.
- **Red:** asignar IP pública.
- Anotar la IP (ej. `129.151.116.139`).

### 3.2 Network Security Group (NSG) — Oracle Cloud

En la consola de Oracle: **Networking → Virtual cloud networks → tu VCN → Network security groups** (o Security Lists de la subnet).

Agregar reglas **Ingress**:

| Source | Protocol | Port | Descripción |
|--------|----------|------|-------------|
| `0.0.0.0/0` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 3000 | Backend API |
| `0.0.0.0/0` | TCP | 8883 | Mosquitto MQTTS |

**Importante:** Oracle tiene dos capas de firewall:
1. **NSG / Security List** (consola web) — reglas de red en el cloud.
2. **iptables / firewalld** dentro de la VM.

Si abrís el puerto en NSG pero no responde desde afuera, revisá también la VM.

### 3.3 Firewall en la VM (Ubuntu)

```bash
# Ver si firewalld está activo
sudo firewall-cmd --state 2>/dev/null || echo "firewalld no instalado"

# Si usás ufw:
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8883/tcp
sudo ufw reload
```

### 3.4 Instalación nativa (recomendada en VM de 1 GB)

Sin Docker — usa menos RAM.

```bash
ssh ubuntu@TU_IP_PUBLICA
git clone https://github.com/gtala/chiro-app.git ~/chiro-app
cd ~/chiro-app
cp backend/.env.example backend/.env
nano backend/.env   # Completar Atlas
bash scripts/oracle-setup-native.sh
```

El script:
- Crea swap de 1 GB.
- Instala Node 20, Mosquitto, certificados MQTTS.
- Configura `systemd` para backend y Mosquitto.

### 3.5 Certificados MQTTS con IP pública

El ESP32 conecta por IP, no por `localhost`. Regenerar certs incluyendo la IP:

```bash
cd ~/chiro-app
BROKER_PUBLIC_IP=TU_IP_PUBLICA FORCE_REGEN=1 ./scripts/generate-certs.sh /tmp/mosquitto-certs
sudo cp /tmp/mosquitto-certs/* /etc/mosquitto/certs/
sudo systemctl restart mosquitto
sudo systemctl restart chiro-backend
```

Copiar el CA al ESP32:

```bash
# En tu máquina de desarrollo
scp ubuntu@TU_IP:/etc/mosquitto/certs/ca.crt sistema_embebido/main/broker_CA.crt
```

### 3.6 Alternativa: Docker en VM más grande

```bash
bash scripts/oracle-setup.sh
# o manualmente:
docker compose -f docker-compose.prod.yml up -d --build
```

### 3.7 Verificar backend en Oracle

```bash
# Desde la VM
curl http://localhost:3000/status
curl http://localhost:3000/dispositivos
journalctl -u chiro-backend -f
journalctl -u mosquitto -f   # o: sudo tail -f /var/log/mosquitto/mosquitto.log

# Desde tu PC
curl http://TU_IP_PUBLICA:3000/status
curl http://TU_IP_PUBLICA:3000/dispositivos
```

### Problemas frecuentes — Oracle / Mosquitto / Backend

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `curl` timeout desde afuera, OK en localhost | NSG o firewall cerrado | Reglas ingress 3000/8883 en NSG + ufw/firewalld |
| Backend `inactive (dead)` | Error en `.env` o Mongo | `journalctl -u chiro-backend -n 50` |
| Mosquitto no arranca | Certificados faltantes | Verificar `/etc/mosquitto/certs/` y `deploy/mosquitto.conf` |
| ESP32 no conecta MQTTS | Puerto 8883 cerrado o CA incorrecto | Abrir 8883; copiar `ca.crt` al firmware |
| `SSL - Certificate verified failed` en ESP32 | CN del cert es `localhost`, conectás por IP | Usar `skip_cert_common_name_check = true` o regenerar cert con SAN IP |
| Logs triplicados en Mongo | Varios procesos backend suscritos al MQTT | `systemctl status chiro-backend`; matar duplicados Docker/Podman |
| Podman `netavark` error al restart | Red de contenedor corrupta | `sudo podman start chiro-mosquitto` o usar setup nativo |
| VM se queda sin memoria | 1 GB + Docker | Usar `oracle-setup-native.sh` (swap + systemd, sin Docker) |

---

## 4. Vercel (Frontend)

### 4.1 Importar proyecto

1. [vercel.com](https://vercel.com) → **Add New Project** → importar `gtala/chiro-app`.
2. **Root Directory:** raíz del repo (el build corre en `frontend/` según config del proyecto).
3. Framework: **Next.js**.

### 4.2 Variables de entorno

| Variable | Valor | Notas |
|----------|-------|-------|
| `API_URL` | `http://TU_IP_ORACLE:3000/` | **Con barra final.** Usada por rewrites server-side |

**No** configurar `NEXT_PUBLIC_API_HOST_URL` apuntando a `http://...` — el browser bloquea mixed content (HTTPS → HTTP).

### 4.3 Deploy

```bash
# Desde la raíz del repo
npx vercel --prod
```

URL de producción (ej.): `https://chiro-app-ten.vercel.app`

### 4.4 Fixes necesarios para producción (frontend/backend)

Si desplegás el código base del TP sin estos cambios, la home puede funcionar pero **la página de logs queda vacía** en Vercel:

1. **`frontend/next.config.js`** — no reescribir `/dispositivos/:id` al backend (es página Next.js):

```js
// QUITAR esta línea:
{ source: "/dispositivos/:path*", destination: `${apiUrl}dispositivos/:path*` },
```

2. **`frontend/pages/dispositivos/[dispositivoId].tsx`** — cargar logs con `getServerSideProps` (el `router.query` es `undefined` en el primer render cliente).

3. **`frontend/api/dispositivos.ts`** — no hacer fetch si `dispositivoId` es `undefined`.

4. **`backend/routers/prueba.router/index.js`** — `/dispositivos/:id` debe aceptar `dispositivoId` numérico (`1`), no solo `_id` de Mongo.

### Problemas frecuentes — Vercel

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Home carga, logs vacíos | Bug `useLogsById(undefined)` | Fix `getServerSideProps` (arriba) |
| `Cast to ObjectId failed for value '1'` | Rewrite envía `/dispositivos/1` al backend | Quitar rewrite `:path*` |
| Mixed content blocked | Frontend HTTPS llama backend HTTP directo | Solo `API_URL` + rewrites, no `NEXT_PUBLIC_*` HTTP |
| Build falla `react-is` | Dependencia faltante | `npm install react-is` en frontend |
| `ENOENT react-is` en build | Idem | Ver commit `Fix Vercel build: add react-is` |
| Deploy path error `frontend/frontend` | Root directory mal configurado | Deploy desde raíz del repo o ajustar en Vercel Settings |
| Datos viejos en pantalla | Cache del browser | Hard refresh: Cmd+Shift+R |

---

## 5. ESP32 (producción)

### Diferencias local vs nube

| | Local (TP) | Producción (Oracle) |
|---|-----------|---------------------|
| Broker | `mqtts://192.168.x.x:8883` | `mqtts://TU_IP:8883` |
| TLS | client.crt + client.key + CA | Solo CA del broker |
| WiFi | `sdkconfig` / menuconfig | Igual — tu red 2.4 GHz |
| CN check | Puede no hacer falta | `skip_cert_common_name_check = true` si cert CN=localhost |

### Pasos

```bash
cd sistema_embebido

# 1. CA del broker Oracle
cp ../mosquitto/certs/ca.crt main/broker_CA.crt
# o desde la VM: scp ubuntu@IP:/etc/mosquitto/certs/ca.crt main/broker_CA.crt

# 2. Editar main/app_main.c
#    BROKER_URI = "mqtts://TU_IP:8883"

# 3. WiFi — usar tu sdkconfig que ya funciona (idf.py menuconfig)
#    SSID exacto (case-sensitive): ej. GuilleWIFI24

# 4. Compilar y flashear
. ~/esp/esp-idf/export.sh
idf.py set-target esp32
idf.py build
idf.py -p /dev/cu.usbserial-XXXX flash monitor
```

En macOS el puerto suele ser `/dev/cu.usbserial-*` (CP2102).

### Probar WiFi antes de flashear (Mac)

```bash
networksetup -setairportnetwork en0 "TU_SSID" "TU_PASSWORD"
system_profiler SPAirPortDataType | grep -A6 "Current Network"
```

El SSID es **case-sensitive** (`GuilleWIFI24` ≠ `guilleWIFI24`).

### Problemas frecuentes — ESP32

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Wi-Fi disconnected, trying to reconnect` | SSID/password incorrectos o 5 GHz | Verificar SSID exacto; red 2.4 GHz; WPA2 Personal |
| WiFi OK, MQTT falla | Broker IP/puerto o cert | Verificar `BROKER_URI`, CA embebido, puerto 8883 abierto |
| `Certificate verify failed` | CN mismatch (localhost vs IP) | `skip_cert_common_name_check = true` |
| Compila en Linux, no en Mac | ESP-IDF no instalado | Instalar IDF 4.4.7 o usar `sistema_embebido/setup-idf.sh` |
| Binario viejo flasheado | `build/` con broker local | Rebuild después de cambiar `BROKER_URI` |
| `strings firmware.bin \| grep mqtts` muestra IP vieja | No recompiló | `idf.py fullclean build` |

---

## 6. Checklist punta a punta

```bash
# 1. Oracle — backend
curl http://TU_IP:3000/status
# → {"status":200}

# 2. Oracle — dispositivos (vacío al inicio OK)
curl http://TU_IP:3000/dispositivos

# 3. Vercel — proxy
curl https://TU_APP.vercel.app/dispositivos
curl https://TU_APP.vercel.app/logs/1

# 4. ESP32 — monitor serial
# → Got IPv4 event
# → MQTT_EVENT_PUBLISHED
# → Temperature: XX.XX C

# 5. Mongo — logs aparecen
curl http://TU_IP:3000/logs/1
# → array con etemperatura, nodoId, ts

# 6. Browser
# → https://TU_APP.vercel.app/ muestra dispositivo
# → https://TU_APP.vercel.app/dispositivos/1 muestra logs
```

---

## 7. Orden recomendado de despliegue

1. Clonar repo y probar **local** (Docker + Atlas + frontend dev).
2. Configurar **MongoDB Atlas**.
3. Crear **Oracle VM**, abrir NSG (22, 3000, 8883), correr `oracle-setup-native.sh`.
4. Regenerar **certificados** con IP pública.
5. Deploy **Vercel** con `API_URL` + fixes de logs.
6. Flashear **ESP32** con broker Oracle + CA + WiFi.
7. Verificar checklist de arriba.

---

## 8. Comandos útiles de diagnóstico

```bash
# Oracle — servicios
sudo systemctl status mosquitto chiro-backend
journalctl -u chiro-backend -f
sudo tail -f /var/log/mosquitto/mosquitto.log

# Oracle — puertos escuchando
sudo ss -tlnp | grep -E '3000|8883'

# Probar MQTTS desde la VM
mosquitto_sub -h localhost -p 8883 --cafile /etc/mosquitto/certs/ca.crt -t '/PLANTA_BAJA/TEMPERATURA' -v

# Publicar mensaje de prueba (simular ESP32)
mosquitto_pub -h localhost -p 8883 --cafile /etc/mosquitto/certs/ca.crt \
  -t '/PLANTA_BAJA/TEMPERATURA' \
  -m '{"dispositivoId":1,"nombre":"ESP32_BMP280_TEMPERATURA","ubicacion":"Planta Baja","temperatura":25.5,"nodoId":0}'

# Ver si llegó a Mongo
curl http://localhost:3000/logs/1 | python3 -m json.tool | head
```

---

## 9. Arquitectura de archivos relevantes

```
chiro-app/
├── backend/.env              # Credenciales Atlas + MQTT (NO commitear)
├── deploy/
│   ├── mosquitto.conf        # Config Mosquitto nativo Oracle
│   └── chiro-backend.service # systemd unit
├── docker-compose.yml        # Stack local completo
├── docker-compose.prod.yml   # Backend + Mosquitto (Oracle Docker)
├── frontend/next.config.js   # Rewrites → API Oracle
├── scripts/
│   ├── generate-certs.sh     # Certificados MQTTS
│   ├── oracle-setup-native.sh
│   └── oracle-setup.sh
└── sistema_embebido/         # Firmware ESP32
```

---

## 10. Seguridad (post-TP)

Para un trabajo práctico la config es permisiva. Para producción real considerar:

- Rotar password de MongoDB Atlas.
- Restringir Network Access de Atlas a la IP de la VM.
- HTTPS en Oracle (nginx + Let's Encrypt) en lugar de HTTP plano.
- No commitear `backend/.env` ni certificados privados.
- Cambiar credenciales WiFi del ESP32 si el repo es público.
