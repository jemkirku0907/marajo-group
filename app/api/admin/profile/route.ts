import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

/**
 * GET /api/admin/profile
 *   ?action=me -> current staff profile details
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "me";

  if (action === "me") {
    const row = await db.queryOne(
      `SELECT id, name, role, role_code, email, created_at FROM staff WHERE id = ? LIMIT 1`,
      [staff.staff_id]
    );
    if (!row) {
      return NextResponse.json({ success: false, message: "Profile not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, profile: row });
  }

  return NextResponse.json({ success: false, message: `Admin profile endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/profile
 *   ?action=update          -> update name/email
 *   ?action=change-password -> verify current password, set new password
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "update") {
    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required." }, { status: 400 });
    }
    await db.execute("UPDATE staff SET name = ?, email = ? WHERE id = ?", [name, email || null, staff.staff_id]);
    return NextResponse.json({ success: true, message: "Profile updated." });
  }

  if (action === "change-password") {
    const currentPassword = String(data.current_password ?? "");
    const newPassword = String(data.new_password ?? "");
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Current and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: "New password must be at least 8 characters." }, { status: 400 });
    }

    const row = await db.queryOne<{ password_hash: string | null }>(
      "SELECT password_hash FROM staff WHERE id = ? LIMIT 1",
      [staff.staff_id]
    );
    if (!row || !row.password_hash) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, row.password_hash);
    if (!matches) {
      return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE staff SET password_hash = ? WHERE id = ?", [newHash, staff.staff_id]);
    return NextResponse.json({ success: true, message: "Password changed successfully." });
  }

  return NextResponse.json({ success: false, message: `Admin profile endpoint not found: ${action}` }, { status: 404 });
}
