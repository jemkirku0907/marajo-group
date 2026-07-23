import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "./db";

const JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || "";
const JWT_ISSUER = "marajo-group";
const JWT_AUDIENCE = "marajo-admin";
export const STAFF_COOKIE = process.env.NODE_ENV === "production" ? "__Host-marajo_staff" : "staff_token";

export type StaffRole = "super_admin" | "admin" | "property_manager" | "staff";
export type StaffCompany = "marajo_group" | "officium_inc";
export const ADMIN_ROLES: StaffRole[] = ["super_admin", "admin", "property_manager"];
export const ADMIN_COMPANY: StaffCompany = "marajo_group";

export type StaffUser = {
  staff_id: number;
  name: string;
  role: string;
  role_code: StaffRole;
  company_code: StaffCompany;
  type: "staff";
  iat?: number;
  exp?: number;
};

type DbStaff = {
  id: number;
  name: string;
  role: string;
  role_code: StaffRole;
  company_code: StaffCompany | null;
  password_hash: string | null;
  is_active: number;
};

function requireSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local before going live.");
  }
  return JWT_SECRET;
}

export function generateStaffToken(payload: Omit<StaffUser, "iat" | "exp">, expiryHours = 4): string {
  return jwt.sign(payload, requireSecret(), {
    algorithm: "HS256",
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    expiresIn: `${expiryHours}h`,
  });
}

export function verifyStaffToken(token: string): StaffUser | null {
  try {
    const decoded = jwt.verify(token, requireSecret(), {
      algorithms: ["HS256"],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    }) as StaffUser;
    if (decoded.type !== "staff") return null;
    decoded.company_code = decoded.company_code || ADMIN_COMPANY;
    return decoded;
  } catch {
    return null;
  }
}

/** Mirrors login.php's $_SESSION['staff_id'] check, but reads the staff_token cookie instead. */
export function getCurrentStaff(req: NextRequest): StaffUser | null {
  const cookieToken = req.cookies.get(STAFF_COOKIE)?.value;
  if (!cookieToken) return null;
  return verifyStaffToken(cookieToken);
}

/** Mirrors requireAdmin() used in api/admin/*.php. Returns the staff user or null if unauthorized. */
export function requireAdmin(req: NextRequest): StaffUser | null {
  const staff = getCurrentStaff(req);
  if (!staff) return null;
  if (!ADMIN_ROLES.includes(staff.role_code)) return null;
  if ((staff.company_code || ADMIN_COMPANY) !== ADMIN_COMPANY) return null;
  return staff;
}

const MAX_ATTEMPTS = 10;
const FALLBACK_WINDOW_MS = 5 * 60 * 1000;
const fallbackLoginAttempts = new Map<string, number[]>();

function checkFallbackRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = (fallbackLoginAttempts.get(ip) || []).filter((time) => now - time < FALLBACK_WINDOW_MS);
  fallbackLoginAttempts.set(ip, attempts);
  return attempts.length < MAX_ATTEMPTS;
}

export async function checkStaffRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `admin-login:${ip}`;
    const row = await db.queryOne<{ attempts: number }>(
      `SELECT attempts FROM security_rate_limits
       WHERE key = ? AND window_started_at > NOW() - INTERVAL '5 minutes'
       LIMIT 1`,
      [key],
    );
    return Number(row?.attempts || 0) < MAX_ATTEMPTS;
  } catch {
    console.warn("Shared login rate limit unavailable; using per-instance fallback.");
    return checkFallbackRateLimit(ip);
  }
}

export async function recordStaffLoginFailure(ip: string) {
  try {
    const key = `admin-login:${ip}`;
    await db.execute(
      `INSERT INTO security_rate_limits (key, attempts, window_started_at, updated_at)
       VALUES (?, 1, NOW(), NOW())
       ON CONFLICT (key) DO UPDATE SET
         attempts = CASE
           WHEN security_rate_limits.window_started_at <= NOW() - INTERVAL '5 minutes' THEN 1
           ELSE security_rate_limits.attempts + 1
         END,
         window_started_at = CASE
           WHEN security_rate_limits.window_started_at <= NOW() - INTERVAL '5 minutes' THEN NOW()
           ELSE security_rate_limits.window_started_at
         END,
         updated_at = NOW()`,
      [key],
    );
  } catch {
    const attempts = fallbackLoginAttempts.get(ip) || [];
    attempts.push(Date.now());
    fallbackLoginAttempts.set(ip, attempts);
  }
}

export async function clearStaffLoginFailures(ip: string) {
  fallbackLoginAttempts.delete(ip);
  try {
    await db.execute("DELETE FROM security_rate_limits WHERE key = ?", [`admin-login:${ip}`]);
  } catch {
    // The migration may not have been applied yet; fallback state is already clear.
  }
}

export async function loginStaff(email: string, password: string) {
  const staff = await db.queryOne<DbStaff>(
    "SELECT id, name, role, role_code, company_code, password_hash, is_active FROM staff WHERE email = ? LIMIT 1",
    [email]
  );

  if (!staff || !staff.is_active || !staff.password_hash) {
    return { success: false, message: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, staff.password_hash);
  if (!valid) {
    return { success: false, message: "Invalid email or password." };
  }

  const token = generateStaffToken({
    staff_id: staff.id,
    name: staff.name,
    role: staff.role,
    role_code: staff.role_code,
    company_code: staff.company_code || ADMIN_COMPANY,
    type: "staff",
  });

  return {
    success: true,
    message: "Login successful",
    token,
    staff: { id: staff.id, name: staff.name, role: staff.role, role_code: staff.role_code, company_code: staff.company_code || ADMIN_COMPANY },
  };
}
