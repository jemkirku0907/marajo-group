import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?", [table]);
  return rows.length > 0;
}

/**
 * GET /api/admin/calendar
 *   ?action=events&month=YYYY-MM -> combined appointments + parking reservations for the month
 * Mirrors the "calendar" section of dashboard.php (events grouped by date)
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "events";

  if (action === "events") {
    const month = req.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM
    const startDate = `${month}-01`;

    const events: any[] = [];

    const hasAppointments = await tableExists("appointments");
    if (hasAppointments) {
      const appts = await db.query(
        `SELECT id, title, client_name, property_name, unit_name, appt_date, appt_time, status
         FROM appointments
         WHERE TO_CHAR(appt_date, 'YYYY-MM') = ?
         ORDER BY appt_date ASC, appt_time ASC`,
        [month]
      );
      for (const a of appts as any[]) {
        events.push({
          type: "appointment",
          id: a.id,
          date: a.appt_date,
          time: a.appt_time,
          label: a.title || a.client_name || "Appointment",
          sublabel: [a.property_name, a.unit_name].filter(Boolean).join(" / "),
          status: a.status,
        });
      }
    }

    const hasReservations = await tableExists("parking_reservations");
    if (hasReservations) {
      const reservations = await db.query(
        `SELECT id, full_name, slot_number, reservation_date, entry_time, exit_time, reservation_status
         FROM parking_reservations
         WHERE TO_CHAR(reservation_date, 'YYYY-MM') = ?
         ORDER BY reservation_date ASC, entry_time ASC`,
        [month]
      );
      for (const r of reservations as any[]) {
        events.push({
          type: "parking",
          id: r.id,
          date: r.reservation_date,
          time: r.entry_time,
          label: r.full_name || `Slot ${r.slot_number}`,
          sublabel: `${r.entry_time ?? ""} – ${r.exit_time ?? ""}`,
          status: r.reservation_status,
        });
      }
    }

    // Group by date
    const grouped: Record<string, any[]> = {};
    for (const ev of events) {
      const d = String(ev.date).slice(0, 10);
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(ev);
    }

    return NextResponse.json({ success: true, month, events, grouped, start: startDate });
  }

  return NextResponse.json({ success: false, message: `Admin calendar endpoint not found: ${action}` }, { status: 404 });
}
