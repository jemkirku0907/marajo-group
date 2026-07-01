import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendParkingReceipt } from "@/lib/mail";

function calcHours(entry: string, exit: string): number {
  let start = new Date(`2026-01-01T${entry}`).getTime();
  let end = new Date(`2026-01-01T${exit}`).getTime();
  if (end <= start) end += 86400000;
  return Math.max(1, Math.round(((end - start) / 3600000) * 100) / 100);
}

async function getRate(facilityId: number, type: "hourly" | "daily", fallback: number): Promise<number> {
  const row = await db.queryOne<{ amount: number }>(
    "SELECT amount FROM parking_rates WHERE facility_id = ? AND rate_type = ? LIMIT 1",
    [facilityId, type]
  );
  return row ? Number(row.amount) : fallback;
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action !== "availability") {
    return NextResponse.json({ success: false, message: "Parking endpoint not found: " + action }, { status: 404 });
  }

  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "You must be logged in to check availability." }, { status: 401 });
  }

  const facilityId = Number(req.nextUrl.searchParams.get("facility_id") || 1);
  const date = req.nextUrl.searchParams.get("reservation_date") || "";
  const entry = req.nextUrl.searchParams.get("entry_time") || "";
  const exit = req.nextUrl.searchParams.get("exit_time") || "";

  if (!facilityId || !date || !entry || !exit) {
    return NextResponse.json({ success: false, message: "facility_id, reservation_date, entry_time and exit_time are required" });
  }

  const slots = await db.query<any>(
    `SELECT id, slot_number, floor_level, slot_type
     FROM parking_slots
     WHERE facility_id = ?
       AND status = 'available'
       AND id NOT IN (
         SELECT slot_id FROM parking_reservations
         WHERE facility_id = ?
           AND reservation_date = ?
           AND reservation_status NOT IN ('cancelled', 'checked_out')
           AND entry_time < ?
           AND exit_time > ?
       )
     ORDER BY floor_level, slot_number`,
    [facilityId, facilityId, date, exit, entry]
  );

  return NextResponse.json({ success: true, count: slots.length, available_slots: slots });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action !== "reserve") {
    return NextResponse.json({ success: false, message: "Parking endpoint not found: " + action }, { status: 404 });
  }

  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Your session has expired. Please log in again and rebook." }, { status: 401 });
  }
  const userId = user.user_id;
  const data = await req.json().catch(() => ({}));

  const required = ["facility_id", "reservation_date", "entry_time", "exit_time", "slot_id", "full_name", "contact_number", "vehicle_type", "plate_number"];
  for (const field of required) {
    if (!data[field]) {
      return NextResponse.json({ success: false, message: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const facilityId = Number(data.facility_id);
  const slotId = Number(data.slot_id);
  const { reservation_date: date, entry_time: entry, exit_time: exit } = data;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [slotRows]: any = await conn.execute(
      "SELECT id, status FROM parking_slots WHERE id = ? AND facility_id = ? FOR UPDATE",
      [slotId, facilityId]
    );
    const slotRow = slotRows[0];
    if (!slotRow || slotRow.status !== "available") {
      throw new Error("That slot is no longer available.");
    }

    const [conflictRows]: any = await conn.execute(
      `SELECT id FROM parking_reservations
       WHERE slot_id = ? AND reservation_date = ?
         AND reservation_status NOT IN ('cancelled', 'checked_out')
         AND entry_time < ? AND exit_time > ? LIMIT 1`,
      [slotId, date, exit, entry]
    );
    if (conflictRows[0]) {
      throw new Error("That slot was just booked for an overlapping time. Please pick another.");
    }

    const hours = calcHours(entry, exit);
    const hourlyRate = await getRate(facilityId, "hourly", 50.0);
    const dailyRate = await getRate(facilityId, "daily", 500.0);
    let base = hours > 8 ? Math.min(hours * hourlyRate, dailyRate) : hours * hourlyRate;
    const vat = Math.round(base * 0.12 * 100) / 100;
    const service = Math.round(base * 0.05 * 100) / 100;
    base = Math.round(base * 100) / 100;
    const total = Math.round((base + vat + service) * 100) / 100;

    const [insertResult]: any = await conn.execute(
      `INSERT INTO parking_reservations
        (user_id, facility_id, slot_id, reservation_date, entry_time, exit_time, total_duration_hours,
         vehicle_type, plate_number, vehicle_color, full_name, contact_number, email,
         reservation_status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        userId,
        facilityId,
        slotId,
        date,
        entry,
        exit,
        hours,
        data.vehicle_type,
        data.plate_number,
        data.vehicle_color || null,
        data.full_name,
        data.contact_number,
        data.email || null,
      ]
    );
    const reservationId = insertResult.insertId;
    const refNumber = `PRK-${dateStamp()}-${String(reservationId).padStart(4, "0")}`;

    await conn.execute(
      `INSERT INTO payments (parking_reservation_id, user_id, amount, base_amount, vat_amount, service_fee, payment_status, reference_number)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [reservationId, userId, total, base, vat, service, refNumber]
    );

    await conn.execute("UPDATE parking_slots SET status = 'reserved' WHERE id = ?", [slotId]);

    await conn.commit();
    conn.release();

    sendParkingReceipt(reservationId).catch((e) => console.error("Parking receipt email failed:", e));

    return NextResponse.json({
      success: true,
      reservation_id: reservationId,
      reference: refNumber,
      fee: total,
      fee_breakdown: { base, vat, service, hours },
    });
  } catch (e: any) {
    await conn.rollback();
    conn.release();
    return NextResponse.json({ success: false, message: e.message }, { status: 400 });
  }
}

function dateStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
