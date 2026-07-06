import nodemailer from "nodemailer";
import { db } from "./db";

const MAIL_FROM = process.env.MAIL_FROM || "Marajo Group <no-reply@marajogroup.com>";

function getTransport() {
  // Configure via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
  // If unset, falls back to a no-op transport (logs only) so booking flows
  // never break locally — mirrors the PHP mail()'s "best effort" behavior.
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  const transport = getTransport();
  if (!transport) {
    console.log(`[mail:disabled] Would send "${subject}" to ${to}`);
    return false;
  }
  try {
    await transport.sendMail({ from: MAIL_FROM, to, replyTo: "no-reply@marajogroup.com", subject, html });
    return true;
  } catch (err) {
    console.error("sendMail failed:", err);
    return false;
  }
}

function layout(
  emoji: string,
  title: string,
  subtitle: string,
  statusLabel: string,
  statusColor: string,
  bodyHtml: string,
  footerNote: string
): string {
  const issued = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#f3f4f6; font-family: 'Segoe UI', Arial, sans-serif; color:#1f2937; }
  .wrapper { max-width:620px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
  .header { background:#1a1a2e; padding:36px 40px 28px; text-align:center; }
  .header h1 { color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px; }
  .header p  { color:#9ca3af; font-size:13px; margin-top:4px; }
  .status-bar { background:#f9fafb; border-bottom:1px solid #e5e7eb; padding:16px 40px; display:flex; align-items:center; justify-content:space-between; }
  .status-badge { display:inline-block; padding:4px 14px; border-radius:999px; font-size:13px; font-weight:600; color:#fff; background:${statusColor}; }
  .ref { font-size:12px; color:#6b7280; }
  .section { padding:28px 40px; border-bottom:1px solid #f3f4f6; }
  .section h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:16px; }
  .row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; }
  .row .label { color:#6b7280; }
  .row .value { font-weight:500; color:#111827; text-align:right; }
  .amount-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; }
  .amount-box .amount-label { font-size:13px; color:#166534; font-weight:500; }
  .amount-box .amount-value { font-size:26px; font-weight:800; color:#15803d; }
  .footer { background:#1a1a2e; padding:24px 40px; text-align:center; }
  .footer p { color:#9ca3af; font-size:12px; line-height:1.7; }
  .footer a { color:#60a5fa; text-decoration:none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><h1>${emoji} ${title}</h1><p>Marajo Group &nbsp;|&nbsp; ${subtitle}</p></div>
  <div class="status-bar"><div class="ref">Issued: ${issued}</div><span class="status-badge">${statusLabel}</span></div>
  ${bodyHtml}
  <div class="footer"><p>${footerNote}<br>For inquiries, contact us at <a href="mailto:info@marajogroup.com">info@marajogroup.com</a><br>or visit <a href="https://marajogroup.com">marajogroup.com</a></p></div>
</div>
</body>
</html>`;
}

function statusColorFor(status: string, map: Record<string, string>, fallback = "#d97706"): string {
  return map[status.toLowerCase()] || fallback;
}

const peso = (n: number) => `₱${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A";
const fmtTime = (t: string | null) =>
  t ? new Date(`2026-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A";
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export async function sendParkingReceipt(reservationId: number): Promise<boolean> {
  const r = await db.queryOne<any>(
    `SELECT pr.*, ps.slot_number, ps.floor_level, ps.slot_type,
            pf.name AS facility_name, pf.location AS facility_location,
            p.amount, p.reference_number
     FROM parking_reservations pr
     LEFT JOIN parking_slots ps ON pr.slot_id = ps.id
     LEFT JOIN parking_facilities pf ON pr.facility_id = pf.id
     LEFT JOIN payments p ON p.parking_reservation_id = pr.id
     WHERE pr.id = ? LIMIT 1`,
    [reservationId]
  );
  if (!r || !r.email) return false;

  const bookingRef = r.reference_number || `PRK-${String(reservationId).padStart(6, "0")}`;
  const facilityLine = r.facility_location ? `${r.facility_name || "Marajo Tower Parking"} (${r.facility_location})` : r.facility_name || "Marajo Tower Parking";
  const vehicle = `${cap(r.vehicle_type || "")} — ${r.plate_number || ""}`;
  const statusColor = statusColorFor(r.reservation_status || "", {
    confirmed: "#16a34a",
    checked_in: "#2563eb",
    checked_out: "#7c3aed",
    cancelled: "#dc2626",
  });
  const amount = r.amount != null ? peso(Number(r.amount)) : "N/A";

  const body = `
  <div class="section"><h2>Client Information</h2>
    <div class="row"><span class="label">Name:</span><span class="value">${r.full_name}</span></div>
    <div class="row"><span class="label">Email:</span><span class="value">${r.email}</span></div>
    <div class="row"><span class="label">Phone:</span><span class="value">${r.contact_number || "N/A"}</span></div>
  </div>
  <div class="section"><h2>Parking Slot</h2>
    <div class="row"><span class="label">Facility:</span><span class="value">${facilityLine}</span></div>
    <div class="row"><span class="label">Slot:</span><span class="value">${r.slot_number || "N/A"} (Floor ${r.floor_level ?? 1}, ${cap(r.slot_type || "standard")})</span></div>
    <div class="row"><span class="label">Vehicle:</span><span class="value">${vehicle}</span></div>
  </div>
  <div class="section"><h2>Schedule</h2>
    <div class="row"><span class="label">Date:</span><span class="value">${fmtDate(r.reservation_date)}</span></div>
    <div class="row"><span class="label">Time:</span><span class="value">${fmtTime(r.entry_time)} – ${fmtTime(r.exit_time)}</span></div>
  </div>
  <div class="section" style="border-bottom:none"><h2>Payment</h2>
    <div class="row"><span class="label">Payment status:</span><span class="value">${cap(r.payment_status || "pending")}</span></div>
    <div style="margin-top:14px"><div class="amount-box"><span class="amount-label">Total Fee:</span><span class="amount-value">${amount}</span></div></div>
  </div>`;

  const html = layout(
    "🅿️",
    "Parking Reservation Receipt",
    "Thank you for your booking",
    cap(r.reservation_status || "pending"),
    statusColor,
    body,
    `This is an official receipt from <strong style="color:#e5e7eb">Marajo Group</strong>. Show this email + booking ref <strong style="color:#e5e7eb">${bookingRef}</strong> at the parking entrance.`
  );

  return sendMail(r.email, `Your Marajo Group Parking Receipt – ${bookingRef}`, html);
}

export async function sendWorkerBookingReceipt(bookingId: number): Promise<boolean> {
  const r = await db.queryOne<any>("SELECT * FROM worker_bookings WHERE id = ? LIMIT 1", [bookingId]);
  if (!r || !r.email) return false;

  const bookingRef = `WRK-${String(bookingId).padStart(6, "0")}`;
  const position = cap((r.position || "").replace(/_/g, " "));
  const statusColor = statusColorFor(r.status || "", { confirmed: "#16a34a", completed: "#2563eb", cancelled: "#dc2626" });
  const notesRow = r.notes ? `<div class="row"><span class="label">Notes</span><span class="value">${r.notes}</span></div>` : "";

  const body = `
  <div class="section"><h2>Client Information</h2>
    <div class="row"><span class="label">Name</span><span class="value">${r.client_name}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">${r.email}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${r.contact_number || "N/A"}</span></div>
  </div>
  <div class="section"><h2>Request Details</h2>
    <div class="row"><span class="label">Position</span><span class="value">${position}</span></div>
    <div class="row"><span class="label">Workers needed</span><span class="value">${r.slots_needed ?? 1}</span></div>
    ${notesRow}
  </div>
  <div class="section" style="border-bottom:none"><h2>Schedule</h2>
    <div class="row"><span class="label">Date</span><span class="value">${fmtDate(r.job_date)}</span></div>
    <div class="row"><span class="label">Shift</span><span class="value">${fmtTime(r.shift_start)} – ${fmtTime(r.shift_end)}</span></div>
  </div>`;

  const html = layout(
    "🧰",
    "Workforce Booking Receipt",
    "We received your request",
    cap(r.status || "pending"),
    statusColor,
    body,
    `This confirms your request was received by <strong style="color:#e5e7eb">Marajo Group</strong>. Your booking reference is <strong style="color:#e5e7eb">${bookingRef}</strong>. Our team will confirm worker assignment shortly.`
  );

  return sendMail(r.email, `Marajo Group Workforce Booking Received – ${bookingRef}`, html);
}

export async function sendCourtBookingReceipt(bookingId: number): Promise<boolean> {
  const r = await db.queryOne<any>("SELECT * FROM court_bookings WHERE id = ? LIMIT 1", [bookingId]);
  if (!r || !r.email) return false;

  const ref = r.reference_number || `CRT-${String(bookingId).padStart(6, "0")}`;
  const statusColor = statusColorFor(r.booking_status || "", {
    confirmed: "#16a34a",
    checked_in: "#2563eb",
    checked_out: "#7c3aed",
    cancelled: "#dc2626",
  });
  const notesRow = r.notes ? `<div class="row"><span class="label">Notes</span><span class="value">${r.notes}</span></div>` : "";

  const body = `
  <div class="section"><h2>Client Information</h2>
    <div class="row"><span class="label">Name:</span><span class="value">${r.full_name}</span></div>
    <div class="row"><span class="label">Email:</span><span class="value">${r.email}</span></div>
    <div class="row"><span class="label">Phone:</span><span class="value">${r.contact_number || "N/A"}</span></div>
  </div>
  <div class="section"><h2>Court Details</h2>
    <div class="row"><span class="label">Court:</span><span class="value">Marajo Tower Multi-Purpose Court</span></div>
    <div class="row"><span class="label">Date:</span><span class="value">${fmtDate(r.booking_date)}</span></div>
    <div class="row"><span class="label">Time:</span><span class="value">${fmtTime(r.start_time)} – ${fmtTime(r.end_time)}</span></div>
    <div class="row"><span class="label">Duration:</span><span class="value">${Number(r.total_hours ?? 1).toFixed(1)} hour(s)</span></div>
    ${notesRow}
  </div>
  <div class="section" style="border-bottom:none"><h2>Payment</h2>
    <div class="row"><span class="label">Court fee (₱1000/hr)</span><span class="value">${peso(Number(r.base_amount ?? 0))}</span></div>
    <div class="row"><span class="label">VAT:</span><span class="value">${peso(Number(r.vat_amount ?? 0))}</span></div>
    <div class="row"><span class="label">Service fee:</span><span class="value">${peso(Number(r.service_fee ?? 0))}</span></div>
    <div class="row"><span class="label">Payment status:</span><span class="value">${cap(r.payment_status || "pending")}</span></div>
    <div style="margin-top:14px"><div class="amount-box"><span class="amount-label">Total Fee:</span><span class="amount-value">${peso(Number(r.total_amount ?? 0))}</span></div></div>
  </div>`;

  const html = layout(
    "🏸",
    "Court Booking Confirmed",
    "Your court is reserved",
    cap(r.booking_status || "confirmed"),
    statusColor,
    body,
    `Show this email + booking ref <strong style="color:#e5e7eb">${ref}</strong> at the court entrance. Payment is collected on-site.`
  );

  return sendMail(r.email, `Your Marajo Court Booking – ${ref}`, html);
}
