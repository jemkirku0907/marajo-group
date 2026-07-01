const attemptsStore = new Map<string, number[]>();

/** Mirrors auth.php checkRateLimit(). In-memory — fine for a single Node instance. */
export function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 300): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const attempts = (attemptsStore.get(key) || []).filter((t) => now - t < windowMs);

  if (attempts.length >= maxAttempts) {
    attemptsStore.set(key, attempts);
    return false;
  }

  attempts.push(now);
  attemptsStore.set(key, attempts);
  return true;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
