import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "";
export const STAFF_COOKIE = "staff_token";

export type StaffRole = "super_admin" | "admin" | "property_manager" | "staff";
export const ADMIN_ROLES: StaffRole[] = ["super_admin", "admin", "property_manager", "staff"];

export type StaffUser = {
  staff_id: number;
  name: string;
  role: string;
  role_code: StaffRole;
  type: "staff";
  iat?: number;
  exp?: number;
};

type DbStaff = {
  id: number;
  name: string;
  role: string;
  role_code: StaffRole;
  password_hash: string | null;
  is_active: number;
};

function requireSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local before going live.");
  }
  return JWT_SECRET;
}

export function generateStaffToken(payload: Omit<StaffUser, "iat" | "exp">, expiryHours = 12): string {
  return jwt.sign(payload, requireSecret(), { expiresIn: `${expiryHours}h` });
}

export function verifyStaffToken(token: string): StaffUser | null {
  try {
    const decoded = jwt.verify(token, requireSecret()) as StaffUser;
    if (decoded.type !== "staff") return null;
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
  return staff;
}

/** Mirrors login.php's brute-force window check, but in-memory (per-process) since there's no PHP session). */
const loginAttempts = new Map<string, number[]>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000;

export function checkStaffRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  loginAttempts.set(ip, attempts);
  return attempts.length < MAX_ATTEMPTS;
}

export function recordStaffLoginFailure(ip: string) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(now);
  loginAttempts.set(ip, attempts);
}

export function clearStaffLoginFailures(ip: string) {
  loginAttempts.delete(ip);
}

export async function loginStaff(email: string, password: string) {
  const staff = await db.queryOne<DbStaff>(
    "SELECT id, name, role, role_code, password_hash, is_active FROM staff WHERE email = ? LIMIT 1",
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
    type: "staff",
  });

  return {
    success: true,
    message: "Login successful",
    token,
    staff: { id: staff.id, name: staff.name, role: staff.role, role_code: staff.role_code },
  };
}
