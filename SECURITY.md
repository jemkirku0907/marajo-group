# Security deployment checklist

The application now defaults to the reduced public surface used by the current
Marajo Group website: public inquiries plus inquiry-focused administration.

## Required before deployment

1. Rotate every database, JWT, SMTP, and Turnstile credential that ever appeared
   in `.env.local` Git history. Removing the file from the current branch does not
   invalidate credentials from older commits.
2. Set independent high-entropy `STAFF_JWT_SECRET` and `USER_JWT_SECRET` values.
   `USER_JWT_SECRET` is only needed when public authentication is intentionally
   enabled.
3. Set `APP_ORIGIN=https://marajogroup.vercel.app` and
   `TURNSTILE_EXPECTED_HOSTNAME=marajogroup.vercel.app` in production.
4. Set `DATABASE_CA_CERT_BASE64` to the base64-encoded trusted database root CA.
   Production database connections fail closed when this value is absent.
5. Run `scripts/security-schema.sql` once with a migration-capable database role.
   The normal application database role should not have `CREATE` or `ALTER`
   privileges.
6. Keep `ENABLE_PUBLIC_AUTH`, `ENABLE_LEGACY_ADMIN_API`, and
   `ENABLE_LEGACY_BOOKING_API` unset unless those retired features are deliberately
   restored and receive a fresh security review.
7. Add a distributed Vercel Firewall or shared-store rate limit for
   `/api/inquiries` and `/api/visitors`. The code-level limiter remains useful as
   defense in depth but is per serverless instance.
8. Enable GitHub secret scanning and push protection on every repository remote.

## Operational practices

- Review active admin accounts monthly and use only `admin`, `super_admin`, or
  `property_manager` roles for inquiry access.
- Remove inactive staff immediately and rotate credentials after staff turnover.
- Retain only the minimum inquiry/contact data required by the business.
- Alert on repeated 401, 403, 413, and 429 responses and unusual inquiry volume.
- Re-run dependency and security checks before every production release.
