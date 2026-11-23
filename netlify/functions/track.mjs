// Nhận sự kiện chơi game và lưu vào Netlify Blobs (kho "events").
// Mỗi lần gửi được lưu thành một bản ghi: events/<ngày>/<mã người chơi>/<thời điểm>.
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  if (raw.length > 100_000) return new Response("Too large", { status: 413 });

  let body;
  try { body = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }

  const pid = String(body.pid || "");
  const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
  if (!/^[a-z0-9-]{8,64}$/i.test(pid) || events.length === 0) {
    return new Response("Bad request", { status: 400 });
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const key = `${day}/${pid}/${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;

  await getStore("events").setJSON(key, {
    pid,
    gid: body.gid ? String(body.gid).slice(0, 64) : null,
    country: context.geo?.country?.code ?? null,
    received: now.toISOString(),
    events: events.map((e) => ({ type: String(e.type).slice(0, 40), t: Number(e.t) || null, d: e.d ?? null })),
  });

  return new Response(null, { status: 204 });
};

export const config = { path: "/api/track" };
