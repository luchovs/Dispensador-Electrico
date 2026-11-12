"use client";
import { useEffect, useState } from "react";

const LIMITE = parseFloat(process.env.NEXT_PUBLIC_LIMITE || "37.5");
const TIMEOUT_MS = 10000; // sin datos por 10s => "sin lectura"

const MODOS = [
  { id: "live", label: "En vivo (sensor)" },
  { id: "none", label: "Sin lectura" },
  { id: "ok", label: "Acceso permitido" },
  { id: "bad", label: "Acceso restringido" },
];

const Shield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.7 8.97a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const Thermo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
  </svg>
);
const Check = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Alert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
  </svg>
);

export default function Home() {
  const [modo, setModo] = useState("live");
  const [live, setLive] = useState({ connected: false, temp: null, ts: null });
  const [now, setNow] = useState(Date.now());

  // Conexión en vivo al servidor (que escucha MQTT)
  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onmessage = (e) => setLive(JSON.parse(e.data));
    es.onerror = () => setLive((p) => ({ ...p, connected: false }));
    return () => es.close();
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  let temp = null;
  if (modo === "live") {
    if (live.temp !== null && live.ts && now - live.ts < TIMEOUT_MS) temp = live.temp;
  } else if (modo === "ok") temp = 36.5;
  else if (modo === "bad") temp = 38.2;

  const estado = temp === null ? "none" : temp >= LIMITE ? "bad" : "ok";
  const activo = modo === "live" ? live.connected : true;

  const texto = { none: "Esperando lectura", ok: "Permitido", bad: "Restringido" }[estado];

  return (
    <main className="wrap">
      <section className="card">
        <header className="head">
          <div className="title">
            <span className="logo"><Shield /></span>
            <h1>Dispensador eléctrico</h1>
          </div>
          <div className="status">
            <span className={`dot ${activo ? "on" : "off"}`} />
            {activo ? "Activo" : "Sin conexión"}
          </div>
        </header>

        <div className="body">
          <div className={`label ${estado}`}><Thermo /> TEMPERATURA</div>
          <div className="reading">
            {temp === null ? (
              <span className="dash" />
            ) : (
              <>
                <span className={`num ${estado}`}>{temp.toFixed(1)}</span>
                <span className="unit">°C</span>
              </>
            )}
          </div>

          <div className={`access ${estado}`}>
            <span className="ico">{estado === "bad" ? <Alert /> : <Check />}</span>
            <div>
              <small>ACCESO</small>
              <strong>{texto}</strong>
            </div>
            <span className="pip" />
          </div>
        </div>
      </section>

      <aside className="side">
        <p>DEMOSTRACIÓN</p>
        {MODOS.map((m) => (
          <button key={m.id} className={modo === m.id ? "sel" : ""} onClick={() => setModo(m.id)}>
            {m.label}
          </button>
        ))}
      </aside>
    </main>
  );
}
