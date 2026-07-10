import { db } from "@/lib/db";

export type TenantMembershipStatus = "pending" | "active" | "inactive" | "rejected";

export type TenantMembership = {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  organization: string;
  building_name: string;
  property_slug: string;
  unit_number: string;
  floor_number: string;
  membership_status: TenantMembershipStatus;
  verified_at: string | null;
  verified_by_admin_id: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

let tenantTableReady = false;

export async function ensureTenantMembershipTable() {
  if (tenantTableReady) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tenant_memberships (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company_name TEXT NOT NULL,
      organization TEXT NOT NULL DEFAULT 'tenant_company',
      building_name TEXT NOT NULL DEFAULT 'Marajo Tower',
      property_slug TEXT NOT NULL DEFAULT 'marajo-tower',
      unit_number TEXT NOT NULL,
      floor_number TEXT NOT NULL,
      membership_status TEXT NOT NULL DEFAULT 'pending',
      verified_at TIMESTAMPTZ,
      verified_by_admin_id INTEGER,
      admin_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute("CREATE INDEX IF NOT EXISTS idx_tenant_memberships_status ON tenant_memberships (membership_status)");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_tenant_memberships_property ON tenant_memberships (property_slug)");

  tenantTableReady = true;
}

export async function getTenantMembership(userId: number): Promise<TenantMembership | null> {
  await ensureTenantMembershipTable();
  return db.queryOne<TenantMembership>("SELECT * FROM tenant_memberships WHERE user_id = ? LIMIT 1", [userId]);
}

export async function requireActiveTenant(userId: number) {
  const membership = await getTenantMembership(userId);
  if (!membership) {
    return {
      ok: false,
      status: "missing" as const,
      message: "Tenant membership verification is required before submitting requests.",
      membership,
    };
  }
  if (membership.membership_status !== "active") {
    return {
      ok: false,
      status: membership.membership_status,
      message:
        membership.membership_status === "pending"
          ? "Your tenant verification is still pending admin review."
          : "Your tenant membership is not active. Please contact Marajo Group.",
      membership,
    };
  }
  return { ok: true, status: "active" as const, message: "Tenant membership verified.", membership };
}

export async function upsertTenantMembership(
  userId: number,
  input: {
    full_name: string;
    email: string;
    phone?: string;
    company_name: string;
    organization: string;
    unit_number: string;
    floor_number: string;
  }
) {
  await ensureTenantMembershipTable();

  // Future integration point: OfficeRnD tenant/member verification.
  // For now, staff verifies Marajo Tower tenancy manually from the admin dashboard.
  return db.queryOne<TenantMembership>(
    `INSERT INTO tenant_memberships
       (user_id, full_name, email, phone, company_name, organization, building_name, property_slug,
        unit_number, floor_number, membership_status, verified_at, verified_by_admin_id, admin_notes)
     VALUES (?, ?, ?, ?, ?, ?, 'Marajo Tower', 'marajo-tower', ?, ?, 'pending', NULL, NULL, NULL)
     ON CONFLICT (user_id)
     DO UPDATE SET
       full_name = EXCLUDED.full_name,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       company_name = EXCLUDED.company_name,
       organization = EXCLUDED.organization,
       building_name = EXCLUDED.building_name,
       property_slug = EXCLUDED.property_slug,
       unit_number = EXCLUDED.unit_number,
       floor_number = EXCLUDED.floor_number,
       membership_status = CASE
         WHEN tenant_memberships.membership_status = 'active' THEN 'active'
         ELSE 'pending'
       END,
       updated_at = NOW()
     RETURNING *`,
    [
      userId,
      input.full_name,
      input.email,
      input.phone || null,
      input.company_name,
      input.organization,
      input.unit_number,
      input.floor_number,
    ]
  );
}
