import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { sendCourtBookingReceipt, sendParkingReceipt, sendWorkerBookingReceipt } from "@/lib/mail";

type ReceiptSource = "parking" | "court" | "workforce";

async function tableExists(tableName: string) {
  const row = await db.queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ?
     ) AS exists`,
    [tableName]
  );
  return !!row?.exists;
}

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

function normalizePaymentStatus(value: string | null | undefined) {
  const status = String(value || "unpaid").toLowerCase();
  if (status === "paid") return "paid";
  if (status === "waived") return "paid";
  return "unpaid";
}

function matchesPaymentFilter(row: any, paymentStatus: string) {
  if (!paymentStatus || paymentStatus === "all") return true;
  return normalizePaymentStatus(row.payment_status) === paymentStatus;
}

function matchesSearch(row: any, search: string) {
  if (!search) return true;
  const haystack = [
    row.customer_name,
    row.email,
    row.reference,
    row.item_name,
    row.source_label,
  ].join(" ").toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function matchesDate(row: any, dateFrom: string, dateTo: string) {
  const raw = String(row.invoice_date || "").slice(0, 10);
  if (!raw) return true;
  if (dateFrom && raw < dateFrom) return false;
  if (dateTo && raw > dateTo) return false;
  return true;
}

async function parkingReceipts() {
  if (!(await tableExists("parking_reservations"))) return [];
  return db.query(
    `SELECT
        pr.id,
        'parking' AS source,
        'Parking' AS source_label,
        COALESCE(p.reference_number, pr.reference_number, CONCAT('PRK-', LPAD(pr.id::text, 6, '0'))) AS reference,
        pr.full_name AS customer_name,
        pr.email,
        COALESCE(p.payment_status, pr.payment_status, 'pending') AS payment_status,
        pr.reservation_status AS request_status,
        COALESCE(p.amount, pr.total_amount, 0) AS amount,
        pr.reservation_date::text AS service_date,
        pr.created_at,
        COALESCE(p.payment_date, pr.created_at) AS invoice_date,
        COALESCE(pf.name, 'Parking Reservation') AS item_name
     FROM parking_reservations pr
     LEFT JOIN payments p ON p.parking_reservation_id = pr.id
     LEFT JOIN parking_facilities pf ON pf.id = pr.facility_id`
  );
}

async function courtReceipts() {
  if (!(await tableExists("court_bookings"))) return [];
  return db.query(
    `SELECT
        cb.id,
        'court' AS source,
        'Court Booking' AS source_label,
        COALESCE(cb.reference_number, CONCAT('CRT-', LPAD(cb.id::text, 6, '0'))) AS reference,
        cb.full_name AS customer_name,
        cb.email,
        COALESCE(cb.payment_status, 'pending') AS payment_status,
        cb.booking_status AS request_status,
        COALESCE(cb.total_amount, 0) AS amount,
        cb.booking_date::text AS service_date,
        cb.created_at,
        cb.created_at AS invoice_date,
        'Marajo Tower Multi-Purpose Court' AS item_name
     FROM court_bookings cb`
  );
}

async function workforceReceipts() {
  if (!(await tableExists("worker_bookings"))) return [];
  return db.query(
    `SELECT
        wb.id,
        'workforce' AS source,
        'Workforce' AS source_label,
        CONCAT('WRK-', LPAD(wb.id::text, 6, '0')) AS reference,
        wb.client_name AS customer_name,
        wb.email,
        'unpaid' AS payment_status,
        wb.status AS request_status,
        NULL::numeric AS amount,
        wb.job_date::text AS service_date,
        wb.created_at,
        wb.created_at AS invoice_date,
        INITCAP(REPLACE(COALESCE(wb.position, 'worker'), '_', ' ')) AS item_name
     FROM worker_bookings wb`
  );
}

export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const paymentStatus = req.nextUrl.searchParams.get("payment_status") || "all";
  const source = req.nextUrl.searchParams.get("source") || "all";
  const dateFrom = req.nextUrl.searchParams.get("date_from") || "";
  const dateTo = req.nextUrl.searchParams.get("date_to") || "";

  const [parking, court, workforce] = await Promise.all([
    parkingReceipts(),
    courtReceipts(),
    workforceReceipts(),
  ]);

  const receipts = [...parking, ...court, ...workforce]
    .filter((row: any) => source === "all" || row.source === source)
    .filter((row: any) => matchesPaymentFilter(row, paymentStatus))
    .filter((row: any) => matchesSearch(row, search))
    .filter((row: any) => matchesDate(row, dateFrom, dateTo))
    .sort((a: any, b: any) => new Date(b.invoice_date || b.created_at).getTime() - new Date(a.invoice_date || a.created_at).getTime())
    .slice(0, 250);

  const summary = receipts.reduce(
    (acc: any, row: any) => {
      const amount = Number(row.amount || 0);
      acc.total += 1;
      acc.amount += amount;
      if (normalizePaymentStatus(row.payment_status) === "paid") {
        acc.paid += 1;
        acc.paid_amount += amount;
      } else {
        acc.unpaid += 1;
        acc.unpaid_amount += amount;
      }
      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, amount: 0, paid_amount: 0, unpaid_amount: 0 }
  );

  return NextResponse.json({ success: true, receipts, summary, count: receipts.length });
}

export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") || "";
  const data = await req.json().catch(() => ({}));
  const id = Number(data.id || 0);
  const source = String(data.source || "") as ReceiptSource;

  if (!id || !["parking", "court", "workforce"].includes(source)) {
    return NextResponse.json({ success: false, message: "Valid source and id are required." }, { status: 400 });
  }

  if (action === "send-receipt") {
    const sent =
      source === "parking"
        ? await sendParkingReceipt(id)
        : source === "court"
          ? await sendCourtBookingReceipt(id)
          : await sendWorkerBookingReceipt(id);
    return NextResponse.json({ success: sent, message: sent ? "Receipt sent." : "Unable to send receipt. Check email and mail configuration." });
  }

  if (action === "set-payment-status") {
    const paymentStatus = String(data.payment_status || "");
    if (!["paid", "pending", "refunded", "waived", "failed"].includes(paymentStatus)) {
      return NextResponse.json({ success: false, message: "Invalid payment status." }, { status: 400 });
    }
    if (source === "parking") {
      await db.execute("UPDATE parking_reservations SET payment_status = ? WHERE id = ?", [paymentStatus, id]);
      await db.execute(
        "UPDATE payments SET payment_status = ?, payment_date = CASE WHEN ? = 'paid' THEN COALESCE(payment_date, NOW()) ELSE payment_date END WHERE parking_reservation_id = ?",
        [paymentStatus, paymentStatus, id]
      );
      return NextResponse.json({ success: true, message: "Parking payment status updated." });
    }
    if (source === "court") {
      await db.execute("UPDATE court_bookings SET payment_status = ? WHERE id = ?", [paymentStatus, id]);
      return NextResponse.json({ success: true, message: "Court payment status updated." });
    }
    return NextResponse.json({ success: false, message: "Workforce bookings do not have payment tracking yet." }, { status: 400 });
  }

  return NextResponse.json({ success: false, message: `Receipts endpoint not found: ${action}` }, { status: 404 });
}
