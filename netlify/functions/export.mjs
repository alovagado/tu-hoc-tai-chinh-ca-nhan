// Tải dữ liệu về dạng CSV (mở bằng Excel/Google Sheets) hoặc JSON.
// Cách dùng: https://<trang-cua-ban>/api/export?key=<EXPORT_KEY>&day=2026-11
//   day: lọc theo ngày hoặc tháng (2026-11-23 hoặc 2026-11). Bỏ trống = tất cả.
//   format=json để lấy JSON thay vì CSV.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const secret = process.env.EXPORT_KEY;
  if (!secret || url.searchParams.get("key") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const prefix = url.searchParams.get("day") || "";
  const format = url.searchParams.get("format") || "csv";
  const store = getStore("events");
  const { blobs } = await store.list({ prefix });

  const rows = [];
  for (let i = 0; i < blobs.length; i += 25) {
    const chunk = await Promise.all(
      blobs.slice(i, i + 25).map((b) => store.get(b.key, { type: "json" }))
    );
    for (const rec of chunk) {
      if (!rec) continue;
      for (const e of rec.events) {
        rows.push({ received: rec.received, country: rec.country, pid: rec.pid, gid: e.gid || rec.gid, type: e.type, t: e.t, data: e.d });
      }
    }
  }

  if (format === "json") return Response.json(rows);

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = ["received,country,pid,gid,type,time,data"];
  for (const r of rows) {
    lines.push([r.received, r.country, r.pid, r.gid, r.type, r.t ? new Date(r.t).toISOString() : "", JSON.stringify(r.data)].map(esc).join(","));
  }
  return new Response("\ufeff" + lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="htc-events-${prefix || "all"}.csv"`,
    },
  });
};

export const config = { path: "/api/export" };
