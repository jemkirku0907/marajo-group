import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

async function tableExists(table: string): Promise<boolean> {
  const rows = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?", [table]);
  return rows.length > 0;
}

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? req.nextUrl.searchParams.get("method") ?? "stats";

  if (action === "stats") {
    if (!(await tableExists("workers"))) {
      return NextResponse.json({
        success: true,
        stats: {
          total_workers: 0,
          active_workers: 0,
          pending_applications: 0,
          completed_jobs: 0,
          payroll_pending: 0,
          pending_bookings: 0,
          confirmed_bookings: 0,
        },
      });
    }
    const total = await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM workers");
    const active = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM workers WHERE availability_status IN ('available','on_job')"
    );
    const pending = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM job_applications WHERE application_status = 'applied'"
    );
    const completed = await db.queryOne<{ c: number }>(
      "SELECT COUNT(*) c FROM job_applications WHERE application_status = 'completed'"
    );
    const payroll = await db.queryOne<{ t: number }>(
      "SELECT COALESCE(SUM(net_earnings),0) t FROM worker_payroll WHERE payroll_status IN ('pending','approved')"
    );
    const pendingBookings = (await tableExists("worker_bookings"))
      ? await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status = 'pending'")
      : { c: 0 };
    const confirmedBookings = (await tableExists("worker_bookings"))
      ? await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status = 'confirmed'")
      : { c: 0 };
    return NextResponse.json({
      success: true,
      stats: {
        total_workers: total?.c ?? 0,
        active_workers: active?.c ?? 0,
        pending_applications: pending?.c ?? 0,
        completed_jobs: completed?.c ?? 0,
        payroll_pending: Number(payroll?.t ?? 0),
        pending_bookings: pendingBookings?.c ?? 0,
        confirmed_bookings: confirmedBookings?.c ?? 0,
      },
    });
  }

  if (action === "workers") {
    if (!(await tableExists("workers"))) {
      return NextResponse.json({ success: true, workers: [], count: 0 });
    }
    const where: string[] = [];
    const params: any[] = [];
    const position = req.nextUrl.searchParams.get("position");
    if (position) {
      where.push("w.position = ?");
      params.push(position);
    }
    const workerName = req.nextUrl.searchParams.get("worker_name");
    if (workerName) {
      where.push("CONCAT(u.first_name,' ',u.last_name) LIKE ?");
      params.push(`%${workerName}%`);
    }
    let sql = `SELECT w.*, u.first_name, u.last_name, u.email, u.phone
               FROM workers w JOIN users u ON w.user_id = u.id`;
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY w.created_at DESC LIMIT 100";
    const rows = await db.query(sql, params);
    return NextResponse.json({ success: true, workers: rows, count: rows.length });
  }

  if (action === "bookings") {
    if (!(await tableExists("worker_bookings"))) {
      return NextResponse.json({ success: true, bookings: [], count: 0 });
    }
    const rows = await db.query(
      `SELECT id, user_id, client_name, contact_number, email, position, slots_needed,
              job_date, shift_start, shift_end, notes, status, created_at, updated_at
       FROM worker_bookings
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return NextResponse.json({ success: true, bookings: rows, count: rows.length });
  }

  return NextResponse.json({ success: false, message: `Admin workforce endpoint not found: ${action}` }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? req.nextUrl.searchParams.get("method") ?? "";
  const data = await req.json().catch(() => ({}));
  const id = Number(data.id) || 0;

  if (action === "approve-worker") {
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    await db.execute("UPDATE workers SET verification_status = 'approved' WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Worker approved" });
  }

  if (action === "reject-worker") {
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    await db.execute("UPDATE workers SET verification_status = 'rejected' WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Worker rejected" });
  }

  if (action === "set-availability") {
    const status = data.status as string;
    const valid = ["available", "unavailable", "on_job", "on_leave"];
    if (!id || !valid.includes(status)) {
      return NextResponse.json({ success: false, message: "id and valid status required" }, { status: 400 });
    }
    await db.execute("UPDATE workers SET availability_status = ? WHERE id = ?", [status, id]);
    return NextResponse.json({ success: true, message: "Availability updated" });
  }

  if (action === "update-booking") {
    const requested = String(data.status || "");
    const valid = ["pending", "approved", "rejected", "confirmed", "cancelled", "completed"];
    if (!id || !valid.includes(requested)) {
      return NextResponse.json({ success: false, message: "id and valid status required" }, { status: 400 });
    }
    if (!(await tableExists("worker_bookings"))) {
      return NextResponse.json({ success: false, message: "worker_bookings table is missing" }, { status: 404 });
    }
    const statusMap: Record<string, string> = { approved: "confirmed", rejected: "cancelled" };
    const status = statusMap[requested] ?? requested;
    await db.execute("UPDATE worker_bookings SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]);
    return NextResponse.json({ success: true, message: "Booking updated", status });
  }

  return NextResponse.json({ success: false, message: `Admin workforce endpoint not found: ${action}` }, { status: 404 });
}
