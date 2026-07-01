import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const row = await db.queryOne<{ ok: number }>("SELECT 1 AS ok");
    return NextResponse.json({ success: true, row });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message ?? String(err) }, { status: 500 });
  }
}
