"use client";

import { useCallback, useEffect, useState } from "react";
import { useMqtt } from "../lib/useMqtt";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-AR");
}

function formatPayload(payload) {
  return JSON.stringify(payload, null, 2);
}

const mqttStatusLabel = {
  connected: "MQTTS conectado (WSS)",
  connecting: "Conectando MQTTS...",
  reconnecting: "Reconectando MQTTS...",
  offline: "MQTTS offline",
  error: "Error MQTTS (¿certificado autofirmado?)",
  disabled: "MQTTS no configurado",
};

export default function HomePage() {
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveNotice, setLiveNotice] = useState("");

  const loadData = useCallback(async (searchTopic = topic) => {
    setLoading(true);
    setError("");

    try {
      const query = searchTopic ? `?topic=${encodeURIComponent(searchTopic)}` : "";
      const [readingsRes, statsRes] = await Promise.all([
        fetch(`/api/readings${query}`),
        fetch("/api/readings/stats"),
      ]);

      if (!readingsRes.ok || !statsRes.ok) {
        throw new Error("No se pudo conectar con el backend");
      }

      const readingsJson = await readingsRes.json();
      const statsJson = await statsRes.json();

      setReadings(readingsJson.data ?? []);
      setStats(statsJson);
    } catch (err) {
      setError(err.message);
      setReadings([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [topic]);

  const mqttStatus = useMqtt((_topic) => {
    setLiveNotice(`Nuevo mensaje en ${_topic}`);
    loadData(topic);
  });

  useEffect(() => {
    loadData("");
  }, [loadData]);

  return (
    <main>
      <h1>Chiro App</h1>
      <p className="subtitle">
        Lecturas MQTTS desde Mosquitto, guardadas en MongoDB local (Docker)
      </p>

      <div className={`mqtt-status mqtt-status--${mqttStatus}`}>
        {mqttStatusLabel[mqttStatus] ?? mqttStatus}
      </div>

      {mqttStatus === "error" && (
        <p className="hint">
          Si usás certificados autofirmados, abrí{" "}
          <a href={process.env.NEXT_PUBLIC_MQTT_WSS_URL} target="_blank" rel="noreferrer">
            {process.env.NEXT_PUBLIC_MQTT_WSS_URL}
          </a>{" "}
          en el navegador y aceptá el certificado.
        </p>
      )}

      {liveNotice && <p className="live-notice">{liveNotice}</p>}

      {stats && (
        <section className="stats">
          <div className="stat-card">
            <div className="stat-label">Total de lecturas</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Último topic</div>
            <div className="stat-value">{stats.latestTopic ?? "—"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Última recepción</div>
            <div className="stat-value" style={{ fontSize: "1rem" }}>
              {formatDate(stats.latestReceivedAt)}
            </div>
          </div>
        </section>
      )}

      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          loadData(topic);
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por topic (ej: chiro/sensores)"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />
        <button type="submit">Buscar</button>
        <button
          type="button"
          onClick={() => {
            setTopic("");
            loadData("");
          }}
        >
          Limpiar
        </button>
        <button type="button" onClick={() => loadData(topic)}>
          Actualizar
        </button>
      </form>

      {loading && <div className="empty">Cargando lecturas...</div>}
      {!loading && error && <div className="error">{error}</div>}
      {!loading && !error && readings.length === 0 && (
        <div className="empty">
          No hay lecturas todavía. Publicá un mensaje MQTTS al broker Mosquitto.
        </div>
      )}

      {!loading && !error && readings.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Topic</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading._id}>
                <td>{formatDate(reading.receivedAt)}</td>
                <td>
                  <span className="badge">{reading.topic}</span>
                </td>
                <td>
                  <pre className="payload">{formatPayload(reading.payload)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
