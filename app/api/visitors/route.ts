import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

let presenceTableReady = false;

async function ensurePresenceTable() {
  if (presenceTableReady) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visitor_presence (
      session_id TEXT PRIMARY KEY,
      path TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_visitor_presence_last_seen
    ON visitor_presence (last_seen)
  `);

  presenceTableReady = true;
}

async function getActiveCount() {
  const row = await db.queryOne<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM visitor_presence WHERE last_seen > NOW() - INTERVAL '75 seconds'"
  );
  return Number(row?.count || 0);
}

export async function GET() {
  try {
    await ensurePresenceTable();
    return NextResponse.json({ success: true, count: await getActiveCount() });
  } catch (error) {
    console.error("[visitors:get]", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensurePresenceTable();

    const data = await req.json().catch(() => ({}));
    const sessionId = String(data.sessionId || "").trim().slice(0, 96);
    const path = String(data.path || "/").trim().slice(0, 240);

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Missing visitor session." }, { status: 400 });
    }

    await db.execute(
      `INSERT INTO visitor_presence (session_id, path, user_agent, last_seen)
       VALUES (?, ?, ?, NOW())
       ON CONFLICT (session_id)
       DO UPDATE SET path = EXCLUDED.path, user_agent = EXCLUDED.user_agent, last_seen = NOW()`,
      [sessionId, path, req.headers.get("user-agent")?.slice(0, 240) || ""]
    );

    await db.execute("DELETE FROM visitor_presence WHERE last_seen < NOW() - INTERVAL '1 day'");

    return NextResponse.json({ success: true, count: await getActiveCount() });
  } catch (error) {
    console.error("[visitors:post]", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
