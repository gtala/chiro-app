import mqtt from "mqtt";
import { env, getMqttTlsOptions } from "../config/env.js";
import { SensorReading } from "../models/SensorReading.js";

function parsePayload(raw) {
  const text = raw.toString();
  try {
    return { parsed: JSON.parse(text), raw: text };
  } catch {
    return { parsed: { value: text }, raw: text };
  }
}

export function startMqttSubscriber() {
  const tls = getMqttTlsOptions();

  const client = mqtt.connect(env.mqttBrokerUrl, {
    clientId: env.mqttClientId,
    reconnectPeriod: 5000,
    ...tls,
  });

  client.on("connect", () => {
    console.log(`MQTTS conectado a ${env.mqttBrokerUrl}`);
    client.subscribe(env.mqttTopic, (err) => {
      if (err) {
        console.error("Error al suscribirse al topic:", err.message);
        return;
      }
      console.log(`Suscrito al topic: ${env.mqttTopic}`);
    });
  });

  client.on("message", async (topic, message) => {
    const { parsed, raw } = parsePayload(message);

    try {
      await SensorReading.create({
        topic,
        payload: parsed,
        rawPayload: raw,
        receivedAt: new Date(),
      });
      console.log(`Guardado mensaje MQTTS de ${topic}`);
    } catch (err) {
      console.error("Error al guardar lectura:", err.message);
    }
  });

  client.on("error", (err) => {
    console.error("Error MQTTS:", err.message);
  });

  client.on("reconnect", () => {
    console.log("Reconectando a Mosquitto (MQTTS)...");
  });

  return client;
}
