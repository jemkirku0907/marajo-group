export function turnstileSiteKey(): string {
  return process.env.TURNSTILE_SITE_KEY || "";
}

function turnstileSecretKey(): string {
  return process.env.TURNSTILE_SECRET_KEY || "";
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey() !== "" && turnstileSecretKey() !== "";
}

export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  // Production must never silently disable bot protection because of a missing key.
  if (!turnstileEnabled()) return process.env.NODE_ENV !== "production";

  const trimmed = (token || "").trim();
  if (trimmed === "") return false;

  try {
    const body = new URLSearchParams({
      secret: turnstileSecretKey(),
      response: trimmed,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.success) return false;

    const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME?.trim();
    if (expectedHostname && data.hostname !== expectedHostname) return false;

    return true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
