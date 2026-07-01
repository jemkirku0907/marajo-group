import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

const APPT_STATUSES = ["upcoming", "completed", "cancelled"];

/**
 * GET /api/admin/appointments
 *   ?action=list -> all appointments
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT a.*, i.name AS lead_name
       FROM appointments a
       LEFT JOIN inquiries i ON a.inquiry_id = i.id
       ORDER BY a.appt_date DESC, a.appt_time DESC`
    );
    return NextResponse.json({ success: true, appointments: rows, count: rows.length, statuses: APPT_STATUSES });
  }

  return NextResponse.json({ success: false, message: `Admin appointments endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/appointments
 *   ?action=create        -> insert new appointment
 *   ?action=update-status -> mark upcoming/completed/cancelled
 *   ?action=delete        -> remove appointment
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "create") {
    const title = String(data.title ?? "").trim();
    const apptDate = String(data.appt_date ?? "").trim();
    const apptTime = String(data.appt_time ?? "").trim();
    if (!title || !apptDate || !apptTime) {
      return NextResponse.json({ success: false, message: "Title, date, and time are required." }, { status: 400 });
    }

    const result = await db.execute(
      `INSERT INTO appointments
        (inquiry_id, contact_id, title, client_name, client_email, client_phone, property_name, unit_name, notes, appt_date, appt_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [
        data.inquiry_id ? Number(data.inquiry_id) : null,
        data.contact_id ? Number(data.contact_id) : null,
        title,
        String(data.client_name ?? "").trim() || null,
        String(data.client_email ?? "").trim() || null,
        String(data.client_phone ?? "").trim() || null,
        String(data.property_name ?? "").trim() || null,
        String(data.unit_name ?? "").trim() || null,
        String(data.notes ?? "").trim() || null,
        apptDate,
        apptTime,
      ]
    );

    return NextResponse.json({ success: true, message: "Appointment created.", id: result.insertId });
  }

  if (action === "update-status") {
    const id = Number(data.id ?? 0);
    const status = String(data.status ?? "").trim();
    if (!id || !APPT_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid appointment status update." }, { status: 400 });
    }
    await db.execute("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
    return NextResponse.json({ success: true, message: "Appointment status updated." });
  }

  if (action === "delete") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid appointment ID." }, { status: 400 });
    }
    await db.execute("DELETE FROM appointments WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Appointment deleted." });
  }

  return NextResponse.json({ success: false, message: `Admin appointments endpoint not found: ${action}` }, { status: 404 });
}
