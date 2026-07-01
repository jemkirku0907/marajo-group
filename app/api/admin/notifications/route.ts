import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

/**
 * GET /api/admin/notifications
 *   ?action=list -> notifications for this staff (staff_id = 0 are broadcast/system)
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT * FROM notifications
       WHERE staff_id = ? OR staff_id = 0
       ORDER BY created_at DESC LIMIT 50`,
      [staff.staff_id]
    );
    const unreadCount = await db.queryOne<{ c: number }>(
      `SELECT COUNT(*) c FROM notifications WHERE (staff_id = ? OR staff_id = 0) AND is_read = 0`,
      [staff.staff_id]
    );
    return NextResponse.json({ success: true, notifications: rows, count: rows.length, unread_count: Number(unreadCount?.c ?? 0) });
  }

  return NextResponse.json({ success: false, message: `Admin notifications endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/notifications
 *   ?action=mark-read     -> mark a single notification read
 *   ?action=mark-all-read -> mark all of this staff's notifications read
 *   ?action=delete        -> remove a notification
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "mark-read") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid notification ID." }, { status: 400 });
    }
    await db.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND (staff_id = ? OR staff_id = 0)", [id, staff.staff_id]);
    return NextResponse.json({ success: true, message: "Notification marked as read." });
  }

  if (action === "mark-all-read") {
    await db.execute("UPDATE notifications SET is_read = 1 WHERE staff_id = ? OR staff_id = 0", [staff.staff_id]);
    return NextResponse.json({ success: true, message: "All notifications marked as read." });
  }

  if (action === "delete") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid notification ID." }, { status: 400 });
    }
    await db.execute("DELETE FROM notifications WHERE id = ? AND (staff_id = ? OR staff_id = 0)", [id, staff.staff_id]);
    return NextResponse.json({ success: true, message: "Notification deleted." });
  }

  return NextResponse.json({ success: false, message: `Admin notifications endpoint not found: ${action}` }, { status: 404 });
}
