import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function readOptionalFile(path) {
  if (!path) return undefined;
  try {
    return fs.readFileSync(path);
  } catch {
    console.warn(`No se pudo leer el certificado: ${path}`);
    return undefined;
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongodbUri: process.env.MONGODB_URI,
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || "mqtts://localhost:8883",
  mqttTopic: process.env.MQTT_TOPIC || "chiro/sensores/#",
  mqttClientId: process.env.MQTT_CLIENT_ID || "chiro-backend",
  mqttCaCertPath: process.env.MQTT_CA_CERT,
  mqttTlsInsecure: process.env.MQTT_TLS_INSECURE === "true",
};

export function getMqttTlsOptions() {
  const ca = readOptionalFile(env.mqttCaCertPath);

  if (ca) {
    return { ca, rejectUnauthorized: !env.mqttTlsInsecure };
  }

  if (env.mqttTlsInsecure) {
    return { rejectUnauthorized: false };
  }

  return {};
}

if (!env.mongodbUri) {
  console.warn("MONGODB_URI no está definida.");
}
