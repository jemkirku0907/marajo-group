import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { noStoreHeaders } from "@/lib/security";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

/**
 * GET /api/admin/contacts
 *   ?action=list -> all contacts
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT id, name, email, phone, property_interest, unit_interest, last_inquiry_at, created_at
       FROM contacts ORDER BY last_inquiry_at DESC, created_at DESC`
    );
    return NextResponse.json(
      { success: true, contacts: rows, count: rows.length },
      { headers: noStoreHeaders },
    );
  }

  return NextResponse.json({ success: false, message: `Admin contacts endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/contacts
 *   ?action=create -> insert new contact
 *   ?action=update -> update contact fields
 *   ?action=delete -> remove contact
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "create") {
    const name = String(data.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ success: false, message: "Contact name is required." }, { status: 400 });
    }
    const email = String(data.email ?? "").trim() || null;

    try {
      const result = await db.execute(
        `INSERT INTO contacts (name, email, phone, property_interest, unit_interest, last_inquiry_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          name,
          email,
          String(data.phone ?? "").trim() || null,
          String(data.property_interest ?? "").trim() || null,
          String(data.unit_interest ?? "").trim() || null,
        ]
      );
      return NextResponse.json({ success: true, message: "Contact created.", id: result.insertId });
    } catch (e: any) {
      if (String(e.message).includes("Duplicate entry")) {
        return NextResponse.json({ success: false, message: "A contact with this email already exists." }, { status: 409 });
      }
      console.error("Unable to create contact.", { code: e?.code });
      return NextResponse.json({ success: false, message: "Unable to create contact." }, { status: 500 });
    }
  }

  if (action === "update") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid contact ID." }, { status: 400 });
    }
    const fields: string[] = [];
    const values: any[] = [];
    const map: Record<string, any> = {
      name: data.name !== undefined ? String(data.name).trim() : undefined,
      email: data.email !== undefined ? String(data.email).trim() : undefined,
      phone: data.phone !== undefined ? String(data.phone).trim() : undefined,
      property_interest: data.property_interest !== undefined ? String(data.property_interest).trim() : undefined,
      unit_interest: data.unit_interest !== undefined ? String(data.unit_interest).trim() : undefined,
    };
    for (const [key, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update." }, { status: 400 });
    }
    values.push(id);
    await db.execute(`UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`, values);
    return NextResponse.json({ success: true, message: "Contact updated." });
  }

  if (action === "delete") {
    if (!['super_admin', 'admin'].includes(staff.role_code)) {
      return NextResponse.json({ success: false, message: "Insufficient permissions." }, { status: 403 });
    }
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid contact ID." }, { status: 400 });
    }
    await db.execute("DELETE FROM contacts WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Contact deleted." });
  }

  return NextResponse.json({ success: false, message: `Admin contacts endpoint not found: ${action}` }, { status: 404 });
}
