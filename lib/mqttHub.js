import mqtt from "mqtt";

// Singleton: una sola conexión MQTT compartida por todos los clientes web
const g = globalThis;

if (!g.__hub) {
  const hub = { connected: false, temp: null, ts: null, listeners: new Set() };
  const topic = process.env.MQTT_TOPIC || "raspberry/sensor/temperatura";
  const client = mqtt.connect(process.env.MQTT_URL || "mqtt://10.56.2.30:1883", {
    reconnectPeriod: 3000,
  });

  const emit = () => {
    const data = { connected: hub.connected, temp: hub.temp, ts: hub.ts };
    hub.listeners.forEach((fn) => fn(data));
  };

  client.on("connect", () => {
    hub.connected = true;
    client.subscribe(topic);
    console.log("✅ MQTT conectado, suscripto a", topic);
    emit();
  });
  client.on("close", () => { hub.connected = false; emit(); });
  client.on("error", (e) => console.error("MQTT error:", e.message));
  client.on("message", (_t, payload) => {
    const v = parseFloat(payload.toString());
    if (!Number.isNaN(v)) {
      hub.temp = v;
      hub.ts = Date.now();
      emit();
    }
  });

  g.__hub = hub;
}

export const hub = g.__hub;
