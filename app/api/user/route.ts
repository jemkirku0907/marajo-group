import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const user = getCurrentUser(req);
  if (!user) return unauthorized();

  if (action === "profile") {
    const profile = await db.queryOne<any>(
      "SELECT id, email, first_name, last_name, phone, address, created_at FROM users WHERE id = ? LIMIT 1",
      [user.user_id]
    );
    if (!profile) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    profile.name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email;
    return NextResponse.json({ success: true, user: profile });
  }

  if (action === "history") {
    const userId = user.user_id;
    const history: any[] = [];

    try {
      const parking = await db.query<any>(
        `SELECT pr.id,
                COALESCE(
                  p.reference_number,
                  CONCAT('PRK-', TO_CHAR(COALESCE(pr.created_at, NOW()), 'YYYYMMDD'), '-', LPAD(pr.id::text, 4, '0'))
                ) AS reference,
                pr.reservation_date AS booking_date, pr.entry_time, pr.exit_time,
                pr.total_duration_hours AS duration_hours,
                pr.reservation_status AS status, pr.payment_status AS payment_status,
                pr.plate_number, pr.vehicle_type, pr.full_name, pr.email AS contact_email,
                COALESCE(p.amount, 0) AS total_amount, pr.created_at
         FROM parking_reservations pr
         LEFT JOIN payments p ON p.parking_reservation_id = pr.id
         WHERE pr.user_id = ?
         ORDER BY pr.created_at DESC
         LIMIT 50`,
        [userId]
      );
      for (const row of parking) {
        history.push({
          type: "parking",
          type_label: "Parking",
          id: row.id,
          reference: row.reference,
          date: row.booking_date,
          status: row.status,
          payment_status: row.payment_status,
          details: `${row.vehicle_type} • ${row.plate_number} (${row.full_name})`,
          total: Number(row.total_amount),
          meta: {
            entry_time: row.entry_time,
            exit_time: row.exit_time,
            duration_hours: row.duration_hours,
            customer_email: row.contact_email,
          },
          created_at: row.created_at,
        });
      }
    } catch (e) {
      console.error("history (parking) failed:", e);
    }

    try {
      const court = await db.query<any>(
        `SELECT id, reference_number AS reference, booking_date, start_time, end_time,
                total_amount, booking_status AS status, payment_status,
                full_name, email AS contact_email, created_at
         FROM court_bookings
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      );
      for (const row of court) {
        history.push({
          type: "court",
          type_label: "Court",
          id: row.id,
          reference: row.reference,
          date: row.booking_date,
          status: row.status,
          payment_status: row.payment_status,
          details: `${row.full_name} • ${row.contact_email}`,
          total: Number(row.total_amount),
          meta: { start_time: row.start_time, end_time: row.end_time },
          created_at: row.created_at,
        });
      }
    } catch (e) {
      console.error("history (court) failed:", e);
    }

    try {
      const workforce = await db.query<any>(
        `SELECT id, position, job_date, shift_start, shift_end, slots_needed, status,
                email AS contact_email, created_at
         FROM worker_bookings
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      );
      for (const row of workforce) {
        const created = new Date(row.created_at);
        const ymd = `${created.getFullYear()}${String(created.getMonth() + 1).padStart(2, "0")}${String(
          created.getDate()
        ).padStart(2, "0")}`;
        history.push({
          type: "workforce",
          type_label: "Workforce",
          id: row.id,
          reference: `WB-${ymd}-${String(row.id).padStart(4, "0")}`,
          date: row.job_date,
          status: row.status,
          payment_status: null,
          details: `${row.position.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} • ${row.slots_needed} worker(s)`,
          total: null,
          meta: { start_time: row.shift_start, end_time: row.shift_end, position: row.position },
          created_at: row.created_at,
        });
      }
    } catch (e) {
      console.error("history (workforce) failed:", e);
    }

    history.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    return NextResponse.json(
      { success: true, history },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}
