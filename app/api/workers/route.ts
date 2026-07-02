import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWorkerBookingReceipt } from "@/lib/mail";
import { filterFallbackWorkers } from "@/lib/workforce";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const user = getCurrentUser(req);

  if (action === "available-workers") {
    const position = req.nextUrl.searchParams.get("position");
    const shiftDate = req.nextUrl.searchParams.get("shift_date");

    let query = `
      SELECT w.id, CONCAT(u.first_name, ' ', u.last_name) AS name,
             u.email, u.phone AS contact_number,
             w.position, w.experience_years, w.skills, w.rating, w.verification_status, w.availability_status
      FROM workers w
      JOIN users u ON u.id = w.user_id
      WHERE w.verification_status = 'approved' AND w.availability_status = 'available'`;
    const params: any[] = [];
    if (position) {
      query += " AND w.position = ?";
      params.push(position);
    }
    if (shiftDate) {
      query += " AND w.id NOT IN (SELECT worker_id FROM work_schedules WHERE scheduled_date = ?)";
      params.push(shiftDate);
    }
    query += " ORDER BY w.rating DESC, w.experience_years DESC LIMIT 50";

    try {
      const rows = await db.query<any>(query, params);
      const workers = rows.map((r) => ({ ...r, skills: r.skills ? JSON.parse(r.skills) : [] }));
      const list = workers.length ? workers : filterFallbackWorkers(position);
      return NextResponse.json({ success: true, workers: list, count: list.length, source: workers.length ? "database" : "fallback" });
    } catch (e: any) {
      const workers = filterFallbackWorkers(position);
      return NextResponse.json({
        success: true,
        message: "Showing seeded workers while the live directory is unavailable.",
        workers,
        count: workers.length,
        source: "fallback",
        warning: e.message,
      });
    }
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "book") {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "You must be logged in to book a worker." }, { status: 401 });
    }
    const data = await req.json().catch(() => ({}));

    const required = ["position", "job_date", "shift_start", "shift_end", "client_name", "contact_number", "email"];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `Missing field: ${field}` }, { status: 400 });
      }
    }

    try {
      const slotsNeeded = parseInt(data.slots_needed ?? 1, 10) || 1;
      const result = await db.execute(
        `INSERT INTO worker_bookings
         (user_id, client_name, contact_number, email, position, slots_needed, job_date, shift_start, shift_end, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user.user_id || null,
          data.client_name,
          data.contact_number,
          data.email,
          data.position,
          slotsNeeded,
          data.job_date,
          data.shift_start,
          data.shift_end,
          data.notes || "",
        ]
      );
      const bookingId = result.insertId;
      sendWorkerBookingReceipt(bookingId).catch((e) => console.error("Worker booking receipt email failed:", e));

      return NextResponse.json(
        { success: true, message: "Booking request submitted successfully", booking_id: bookingId },
        { status: 201 }
      );
    } catch (e: any) {
      return NextResponse.json({ success: false, message: "Booking system not ready: " + e.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}
