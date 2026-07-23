import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "./db";

const JWT_SECRET = process.env.USER_JWT_SECRET || process.env.JWT_SECRET || "";
const JWT_ISSUER = "marajo-group";
const JWT_AUDIENCE = "marajo-public";

export type AuthUser = {
  user_id: number;
  email: string;
  role: string;
  type: "access";
  iat?: number;
  exp?: number;
};

function requireSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local before going live.");
  }
  return JWT_SECRET;
}

export function generateToken(payload: Omit<AuthUser, "iat" | "exp">, expiryHours = 24): string {
  return jwt.sign(payload, requireSecret(), {
    algorithm: "HS256",
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    expiresIn: `${expiryHours}h`,
  });
}

export function verifyTokenString(token: string): AuthUser | null {
  try {
    return jwt.verify(token, requireSecret(), {
      algorithms: ["HS256"],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    }) as AuthUser;
  } catch {
    return null;
  }
}

/** Mirrors AuthService::getCurrentUser() — reads Bearer token from Authorization header. */
export function getCurrentUser(req: NextRequest): AuthUser | null {
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/Bearer\s+(.+)/i);
  if (!match) return null;
  return verifyTokenString(match[1]);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

type DbUser = {
  id: number;
  password_hash: string;
  role: string;
  first_name: string;
  is_active: number;
};

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  role = "customer"
) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email format" };
  }
  if (password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters" };
  }

  const existing = await db.queryOne<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    return { success: false, message: "Email already registered" };
  }

  const passwordHash = await hashPassword(password);
  const result = await db.execute(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, passwordHash, firstName, lastName, phone, role]
  );

  return { success: true, message: "User registered successfully", user_id: result.insertId };
}

export async function loginUser(email: string, password: string) {
  const user = await db.queryOne<DbUser>(
    "SELECT id, password_hash, role, first_name, is_active FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    return { success: false, message: "Invalid credentials" };
  }
  if (!user.is_active) {
    return { success: false, message: "Account is inactive" };
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, message: "Invalid credentials" };
  }

  await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

  const token = generateToken({
    user_id: user.id,
    email,
    role: user.role,
    type: "access",
  });

  return {
    success: true,
    message: "Login successful",
    token,
    user: { id: user.id, email, role: user.role, name: user.first_name },
  };
}
