import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCourtBookingReceipt } from "@/lib/mail";
import { requireActiveTenant } from "@/lib/tenantMembership";

/* Disabled Facilities availability, rates, conflict checking, and booking handlers.
function courtHours(start: string, end: string): number {
  let s = new Date(`2026-01-01T${start}`).getTime();
  let e = new Date(`2026-01-01T${end}`).getTime();
  if (e <= s) e += 86400000;
  return Math.max(1, Math.round(((e - s) / 3600000) * 100) / 100);
}

function courtFee(hours: number) {
  const base = Math.round(hours * 1000 * 100) / 100;
  return { hours, base, vat: 0, service: 0, total: base };
}

async function hasConflict(date: string, start: string, end: string, excludeId = 0): Promise<boolean> {
  let sql = `SELECT id FROM court_bookings
             WHERE booking_date = ? AND booking_status NOT IN ('cancelled','checked_out')
               AND start_time < ? AND end_time > ?`;
  const params: any[] = [date, end, start];
  if (excludeId > 0) {
    sql += " AND id != ?";
    params.push(excludeId);
  }
  sql += " LIMIT 1";
  const row = await db.queryOne(sql, params);
  return !!row;
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action !== "availability") {
    return NextResponse.json({ success: false, message: "Court endpoint not found: " + action }, { status: 404 });
  }

  const date = req.nextUrl.searchParams.get("booking_date") || "";
  const start = req.nextUrl.searchParams.get("start_time") || "";
  const end = req.nextUrl.searchParams.get("end_time") || "";

  if (!date || !start || !end) {
    return NextResponse.json({ success: false, message: "booking_date, start_time and end_time are required" }, { status: 400 });
  }

  const conflict = await hasConflict(date, start, end);
  const fee = courtFee(courtHours(start, end));

  return NextResponse.json({
    success: true,
    available: !conflict,
    message: conflict
      ? "The court is already booked during that time. Please choose a different slot."
      : "The court is available for your selected time!",
    fee_preview: fee,
  });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action !== "book") {
    return NextResponse.json({ success: false, message: "Court endpoint not found: " + action }, { status: 404 });
  }

  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "You must be logged in to book a facility." }, { status: 401 });
  }
  const tenant = await requireActiveTenant(user.user_id);
  if (!tenant.ok) {
    return NextResponse.json({ success: false, message: tenant.message, membership_status: tenant.status }, { status: 403 });
  }
  const userId = user.user_id;
  const data = await req.json().catch(() => ({}));

  const required = ["full_name", "contact_number", "email", "booking_date", "start_time", "end_time"];
  for (const f of required) {
    if (!data[f]) {
      return NextResponse.json({ success: false, message: `Missing field: ${f}` }, { status: 400 });
    }
  }

  const { booking_date: date, start_time: start, end_time: end, full_name: name, contact_number: phone, email, notes } = data;

  try {
    if (await hasConflict(date, start, end)) {
      throw new Error("The court was just booked during that time. Please pick another slot.");
    }

    const hours = courtHours(start, end);
    const fee = courtFee(hours);
    const ref = `CRT-${dateStamp()}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

    const result = await db.execute(
      `INSERT INTO court_bookings
         (user_id, full_name, contact_number, email, booking_date, start_time, end_time, total_hours,
          booking_status, payment_status, hourly_rate, base_amount, vat_amount, service_fee, total_amount,
          reference_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending', 1000.00, ?, ?, ?, ?, ?, ?)`,
      [userId, name, phone, email, date, start, end, hours, fee.base, fee.vat, fee.service, fee.total, ref, notes || null]
    );
    const bookingId = result.insertId;

    sendCourtBookingReceipt(bookingId).catch((e) => console.error("Court receipt email failed:", e));

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      reference: ref,
      fee: fee.total,
      fee_breakdown: fee,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 400 });
  }
}

function dateStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
*/

export async function GET(_req: NextRequest) {
  return NextResponse.json({ success: false, message: "Facilities booking is currently disabled." }, { status: 410 });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ success: false, message: "Facilities booking is currently disabled." }, { status: 410 });
}
