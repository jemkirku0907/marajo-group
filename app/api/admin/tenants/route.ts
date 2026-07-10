import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { ensureTenantMembershipTable } from "@/lib/tenantMembership";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  await ensureTenantMembershipTable();
  const status = req.nextUrl.searchParams.get("status") || "";
  const search = req.nextUrl.searchParams.get("search") || "";
  const where: string[] = [];
  const params: any[] = [];

  if (status) {
    where.push("tm.membership_status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(tm.full_name ILIKE ? OR tm.email ILIKE ? OR tm.company_name ILIKE ? OR tm.unit_number ILIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  let sql = `
    SELECT tm.*, CONCAT(u.first_name, ' ', u.last_name) AS account_name, u.role AS user_role
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.user_id
  `;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY CASE tm.membership_status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, tm.updated_at DESC LIMIT 200";

  const tenants = await db.query(sql, params);
  return NextResponse.json({ success: true, tenants, count: tenants.length });
}

export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  await ensureTenantMembershipTable();
  const action = req.nextUrl.searchParams.get("action") || "";
  const data = await req.json().catch(() => ({}));
  const id = Number(data.id || 0);
  const notes = String(data.admin_notes || "").trim() || null;

  if (!id) {
    return NextResponse.json({ success: false, message: "Tenant membership id is required." }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    approve: "active",
    reject: "rejected",
    deactivate: "inactive",
    pending: "pending",
  };
  const nextStatus = statusMap[action];
  if (!nextStatus) {
    return NextResponse.json({ success: false, message: `Unknown tenant action: ${action}` }, { status: 404 });
  }

  await db.execute(
    `UPDATE tenant_memberships
     SET membership_status = ?,
         verified_at = CASE WHEN ? = 'active' THEN NOW() ELSE verified_at END,
         verified_by_admin_id = CASE WHEN ? = 'active' THEN ? ELSE verified_by_admin_id END,
         admin_notes = COALESCE(?, admin_notes),
         updated_at = NOW()
     WHERE id = ?`,
    [nextStatus, nextStatus, nextStatus, staff.staff_id, notes, id]
  );

  return NextResponse.json({ success: true, message: `Tenant membership marked ${nextStatus}.`, status: nextStatus });
}
