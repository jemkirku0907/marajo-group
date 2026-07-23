import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

async function getActiveCount() {
  const row = await db.queryOne<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM visitor_presence WHERE last_seen > NOW() - INTERVAL '75 seconds'"
  );
  return Number(row?.count || 0);
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, count: await getActiveCount() });
  } catch (error) {
    console.error("[visitors:get]", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`visitor:${ip}`, 40, 60)) {
      return NextResponse.json({ success: false, message: "Too many updates." }, { status: 429 });
    }

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
       DO UPDATE SET path = EXCLUDED.path, user_agent = EXCLUDED.user_agent, last_seen = NOW()
       RETURNING session_id`,
      [sessionId, path, req.headers.get("user-agent")?.slice(0, 240) || ""]
    );

    return NextResponse.json({ success: true, count: await getActiveCount() });
  } catch (error) {
    console.error("[visitors:post]", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
