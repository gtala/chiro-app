"use client";

import { useEffect, useRef, useState } from "react";

export function useMqtt(onMessage) {
  const [status, setStatus] = useState("connecting");
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const wssUrl = process.env.NEXT_PUBLIC_MQTT_WSS_URL;
    const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || "chiro/sensores/#";

    if (!wssUrl) {
      setStatus("disabled");
      return;
    }

    let client;
    let cancelled = false;

    import("mqtt").then(({ default: mqtt }) => {
      if (cancelled) return;

      client = mqtt.connect(wssUrl, {
        clientId: `chiro-frontend-${Math.random().toString(16).slice(2, 10)}`,
        reconnectPeriod: 5000,
      });

      client.on("connect", () => {
        setStatus("connected");
        client.subscribe(topic, (err) => {
          if (err) setStatus("error");
        });
      });

      client.on("message", (_topic, message) => {
        onMessageRef.current?.(_topic, message.toString());
      });

      client.on("offline", () => setStatus("offline"));
      client.on("error", () => setStatus("error"));
      client.on("reconnect", () => setStatus("reconnecting"));
    });

    return () => {
      cancelled = true;
      client?.end(true);
    };
  }, []);

  return status;
}
