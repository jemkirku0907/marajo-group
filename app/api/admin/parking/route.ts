import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

async function tableExists(table: string): Promise<boolean> {
  const rows = await db.query("SHOW TABLES LIKE ?", [table]);
  return rows.length > 0;
}

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? req.nextUrl.searchParams.get("method") ?? "analytics";

  if (action === "analytics") {
    if (!(await tableExists("parking_reservations"))) {
      return NextResponse.json({
        success: true,
        analytics: {
          total_reservations: 0,
          revenue_today: 0,
          revenue_week: 0,
          revenue_month: 0,
          occupancy_rate: 0,
          peak_hours: [],
        },
      });
    }

    const total = await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations");
    const today = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM parking_reservations WHERE reservation_date = CURDATE()"
    );
    const upcoming = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM parking_reservations WHERE reservation_date >= CURDATE() AND reservation_status NOT IN ('cancelled')"
    );
    const cancelled = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM parking_reservations WHERE reservation_status = 'cancelled'"
    );
    const revToday = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(amount),0) t FROM payments WHERE payment_status='paid' AND DATE(payment_date)=CURDATE()"
    );
    const revWeek = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(amount),0) t FROM payments WHERE payment_status='paid' AND YEARWEEK(payment_date,1)=YEARWEEK(CURDATE(),1)"
    );
    const revMonth = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(amount),0) t FROM payments WHERE payment_status='paid' AND MONTH(payment_date)=MONTH(CURDATE()) AND YEAR(payment_date)=YEAR(CURDATE())"
    );
    const cap = await db.queryOne<{ cap: number; used: number }>(
      "SELECT COALESCE(SUM(total_capacity),0) cap, COALESCE(SUM(occupied_slots+reserved_slots),0) used FROM parking_facilities"
    );
    const peak = await db.query<{ hr: number; total: number }>(
      "SELECT HOUR(entry_time) hr, COUNT(*) total FROM parking_reservations GROUP BY HOUR(entry_time) ORDER BY total DESC LIMIT 5"
    );

    return NextResponse.json({
      success: true,
      analytics: {
        total_reservations: total?.c ?? 0,
        today_reservations: today?.c ?? 0,
        upcoming_reservations: upcoming?.c ?? 0,
        cancelled_reservations: cancelled?.c ?? 0,
        revenue_today: Number(revToday?.t ?? 0),
        revenue_week: Number(revWeek?.t ?? 0),
        revenue_month: Number(revMonth?.t ?? 0),
        occupancy_rate: cap?.cap ? Math.round((cap.used / cap.cap) * 1000) / 10 : 0,
        peak_hours: peak,
      },
    });
  }

  if (action === "reservations") {
    if (!(await tableExists("parking_reservations"))) {
      return NextResponse.json({ success: true, reservations: [], count: 0 });
    }

    const where: string[] = [];
    const params: any[] = [];
    const filterMap: Record<string, string> = {
      date: "pr.reservation_date",
      vehicle_type: "pr.vehicle_type",
      plate_number: "pr.plate_number",
      payment_status: "pr.payment_status",
      reservation_status: "pr.reservation_status",
    };
    for (const [key, col] of Object.entries(filterMap)) {
      const val = req.nextUrl.searchParams.get(key);
      if (val) {
        where.push(`${col} = ?`);
        params.push(val);
      }
    }
    const customerName = req.nextUrl.searchParams.get("customer_name");
    if (customerName) {
      where.push("pr.full_name LIKE ?");
      params.push(`%${customerName}%`);
    }
    const slot = req.nextUrl.searchParams.get("parking_slot");
    if (slot) {
      where.push("ps.slot_number = ?");
      params.push(slot);
    }

    let sql = `SELECT pr.*, ps.slot_number, pf.name facility_name
                FROM parking_reservations pr
                JOIN parking_slots ps ON pr.slot_id = ps.id
                JOIN parking_facilities pf ON pr.facility_id = pf.id`;
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY pr.reservation_date DESC, pr.entry_time DESC LIMIT 100";

    const rows = await db.query(sql, params);
    return NextResponse.json({ success: true, reservations: rows, count: rows.length });
  }

  return NextResponse.json(
    { success: false, message: `Admin parking endpoint not found: ${action}` },
    { status: 404 }
  );
}

export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? req.nextUrl.searchParams.get("method") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "update-reservation") {
    const id = Number(data.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }
    const resStatus = data.reservation_status as string | undefined;
    const paymentStatus = data.payment_status as string | undefined;

    if (!resStatus && !paymentStatus) {
      return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
    }

    const setParts: string[] = [];
    const params: any[] = [];

    if (resStatus) {
      const validRes = ["pending", "confirmed", "active", "completed", "cancelled", "no_show"];
      if (!validRes.includes(resStatus)) {
        return NextResponse.json({ success: false, message: "Invalid reservation_status" }, { status: 400 });
      }
      setParts.push("reservation_status = ?");
      params.push(resStatus);
    }
    if (paymentStatus) {
      const validPay = ["pending", "paid", "refunded", "waived"];
      if (!validPay.includes(paymentStatus)) {
        return NextResponse.json({ success: false, message: "Invalid payment_status" }, { status: 400 });
      }
      setParts.push("payment_status = ?");
      params.push(paymentStatus);
    }
    params.push(id);

    await db.execute(`UPDATE parking_reservations SET ${setParts.join(", ")} WHERE id = ?`, params);

    if (paymentStatus === "paid") {
      await db.execute(
        "UPDATE payments SET payment_status = 'paid', payment_date = NOW() WHERE parking_reservation_id = ? AND payment_status != 'paid'",
        [id]
      );
    }

    return NextResponse.json({ success: true, message: "Reservation updated successfully" });
  }

  return NextResponse.json(
    { success: false, message: `Admin parking endpoint not found: ${action}` },
    { status: 404 }
  );
}

export async function PUT(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? req.nextUrl.searchParams.get("method") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "slot-status") {
    if (!data.slot_id || !data.status) {
      return NextResponse.json({ success: false, message: "slot_id and status are required" }, { status: 400 });
    }
    await db.execute("UPDATE parking_slots SET status = ? WHERE id = ?", [data.status, data.slot_id]);
    return NextResponse.json({ success: true, message: "Slot status updated" });
  }

  return NextResponse.json(
    { success: false, message: `Admin parking endpoint not found: ${action}` },
    { status: 404 }
  );
}
