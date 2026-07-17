import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { sendCourtAcceptedNotice, sendCourtBookingReceipt } from "@/lib/mail";

/* Disabled admin Facilities analytics, booking tables, status management,
   cancellation, and receipt handlers.
function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "bookings";

  if (action === "analytics") {
    const total = await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings");
    const today = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM court_bookings WHERE booking_date = CURRENT_DATE"
    );
    const upcoming = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM court_bookings WHERE booking_date >= CURRENT_DATE AND booking_status NOT IN ('cancelled')"
    );
    const cancelled = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM court_bookings WHERE booking_status = 'cancelled'"
    );
    const revToday = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(total_amount),0) t FROM court_bookings WHERE payment_status='paid' AND created_at::date = CURRENT_DATE"
    );
    const revWeek = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(total_amount),0) t FROM court_bookings WHERE payment_status='paid' AND created_at >= date_trunc('week', CURRENT_DATE) AND created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'"
    );

    return NextResponse.json({
      success: true,
      analytics: {
        total: total?.c ?? 0,
        today: today?.c ?? 0,
        upcoming: upcoming?.c ?? 0,
        cancelled: cancelled?.c ?? 0,
        revenue_today: Number(revToday?.t ?? 0),
        revenue_week: Number(revWeek?.t ?? 0),
      },
    });
  }

  if (action === "bookings") {
    const where: string[] = [];
    const params: any[] = [];

    const bookingStatus = req.nextUrl.searchParams.get("booking_status");
    if (bookingStatus) {
      where.push("booking_status = ?");
      params.push(bookingStatus);
    }
    const paymentStatus = req.nextUrl.searchParams.get("payment_status");
    if (paymentStatus) {
      where.push("payment_status = ?");
      params.push(paymentStatus);
    }
    const bookingDate = req.nextUrl.searchParams.get("booking_date");
    if (bookingDate) {
      where.push("booking_date = ?");
      params.push(bookingDate);
    }
    const search = req.nextUrl.searchParams.get("search");
    if (search) {
      const like = `%${search}%`;
      where.push("(full_name LIKE ? OR email LIKE ? OR contact_number LIKE ? OR reference_number LIKE ?)");
      params.push(like, like, like, like);
    }

    let sql = "SELECT * FROM court_bookings";
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY created_at DESC LIMIT 200";

    const rows = await db.query(sql, params);
    return NextResponse.json({ success: true, bookings: rows, count: rows.length });
  }

  return NextResponse.json({ success: false, message: `Court admin endpoint not found: ${action}` }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));
  const id = Number(data.id) || 0;

  if (action === "update-booking") {
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

    const setParts: string[] = [];
    const params: any[] = [];
    const before = await db.queryOne<{ booking_status: string }>("SELECT booking_status FROM court_bookings WHERE id = ? LIMIT 1", [id]);
    const previousStatus = String(before?.booking_status ?? "");

    if (data.booking_status) {
      const valid = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
      if (!valid.includes(data.booking_status)) {
        return NextResponse.json({ success: false, message: "Invalid booking_status" }, { status: 400 });
      }
      setParts.push("booking_status = ?");
      params.push(data.booking_status);
    }
    if (data.payment_status) {
      const valid = ["pending", "paid", "refunded", "failed"];
      if (!valid.includes(data.payment_status)) {
        return NextResponse.json({ success: false, message: "Invalid payment_status" }, { status: 400 });
      }
      setParts.push("payment_status = ?");
      params.push(data.payment_status);
    }

    if (!setParts.length) {
      return NextResponse.json({ success: false, message: "Nothing to update" });
    }

    params.push(id);
    await db.execute(`UPDATE court_bookings SET ${setParts.join(", ")} WHERE id = ?`, params);
    if (data.booking_status === "confirmed" && previousStatus !== "confirmed") {
      sendCourtAcceptedNotice(id).catch((e) => console.error("Court accepted email failed:", e));
    }
    return NextResponse.json({ success: true, message: "Booking updated" });
  }

  if (action === "cancel") {
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    await db.execute("UPDATE court_bookings SET booking_status = 'cancelled' WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Booking cancelled" });
  }

  if (action === "send-receipt") {
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const sent = await sendCourtBookingReceipt(id);
    return NextResponse.json({ success: sent, message: sent ? "Receipt sent." : "Failed — check mail config." });
  }

  return NextResponse.json({ success: false, message: `Court admin endpoint not found: ${action}` }, { status: 404 });
}
*/

export async function GET(_req: NextRequest) {
  return NextResponse.json({ success: false, message: "Admin Facilities management is currently disabled." }, { status: 410 });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ success: false, message: "Admin Facilities management is currently disabled." }, { status: 410 });
}
