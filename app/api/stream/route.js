import { hub } from "@/lib/mqttHub";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-Sent Events: empuja cada lectura al navegador en vivo
export async function GET(req) {
  const enc = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (d) => controller.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`));
      send({ connected: hub.connected, temp: hub.temp, ts: hub.ts });
      hub.listeners.add(send);
      const ping = setInterval(() => controller.enqueue(enc.encode(": ping\n\n")), 15000);
      cleanup = () => { hub.listeners.delete(send); clearInterval(ping); };
      req.signal.addEventListener("abort", () => { cleanup(); try { controller.close(); } catch {} });
    },
    cancel() { cleanup(); },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
