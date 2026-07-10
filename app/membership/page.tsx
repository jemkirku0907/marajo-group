"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authHeaders, useAuth } from "@/lib/AuthContext";

type Membership = {
  full_name: string;
  email: string;
  phone?: string;
  company_name: string;
  organization: string;
  building_name: string;
  unit_number: string;
  floor_number: string;
  membership_status: "pending" | "active" | "inactive" | "rejected";
  verified_at?: string | null;
  admin_notes?: string | null;
};

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  company_name: "",
  organization: "tenant_company",
  unit_number: "",
  floor_number: "",
};

export default function MembershipPage() {
  const { user, token, loading, openModal } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(false);

  useEffect(() => {
    if (!token || !user) return;
    setLoadingMembership(true);
    fetch("/api/tenant-membership?action=me", { headers: authHeaders(token), cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.membership) {
          const next = data.membership as Membership;
          setMembership(next);
          setForm({
            full_name: next.full_name || user.name || "",
            email: next.email || user.email || "",
            phone: next.phone || "",
            company_name: next.company_name || "",
            organization: next.organization || "tenant_company",
            unit_number: next.unit_number || "",
            floor_number: next.floor_number || "",
          });
        } else {
          setMembership(null);
          setForm((current) => ({ ...current, full_name: user.name || "", email: user.email || "" }));
        }
      })
      .finally(() => setLoadingMembership(false));
  }, [token, user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      openModal("login");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenant-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage({ ok: !!data.success, text: data.message || "Unable to submit verification." });
      if (data.success) setMembership(data.membership);
    } catch {
      setMessage({ ok: false, text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const status = membership?.membership_status || "not submitted";

  return (
    <main className="membership-page">
      <section className="page-hero page-hero--image" style={{ "--page-hero-image": "url('/assets/marajo-tower.jpg')" } as CSSProperties}>
        <div className="page-hero-inner">
          <div className="page-hero-copy">
            <span className="page-hero-eyebrow">Tenant Access</span>
            <h1>Marajo Tower member verification.</h1>
            <p>
              Submit your company, floor, and unit details for admin review. Only verified Marajo Tower tenants can
              submit facility, parking, and workforce requests.
            </p>
          </div>
          <span className="page-hero-side-label">Members</span>
        </div>
      </section>

      <section className="section membership-section">
        <div className="container membership-grid">
          <aside className="membership-status-card">
            <span className={`membership-status-pill status-${String(status).replace(/\s+/g, "-")}`}>{status}</span>
            <h2>Verification status</h2>
            <p>
              {membership?.membership_status === "active"
                ? "Your Marajo Tower tenant access is active. Request forms are enabled for this account."
                : membership?.membership_status === "pending"
                  ? "Your details are waiting for admin review. Request forms unlock once approved."
                  : "Submit your tenant details so the Marajo team can verify your Marajo Tower access."}
            </p>
            <div className="membership-status-list">
              <span>Building</span>
              <strong>{membership?.building_name || "Marajo Tower"}</strong>
              <span>Company</span>
              <strong>{membership?.company_name || "Not submitted"}</strong>
              <span>Floor / Unit</span>
              <strong>{membership ? `${membership.floor_number} / ${membership.unit_number}` : "Not submitted"}</strong>
            </div>
            {membership?.membership_status === "active" && (
              <Link href="/facilities" className="btn-primary membership-card-action">
                Book Facilities
              </Link>
            )}
          </aside>

          <div className="membership-form-card">
            <div className="section-title">
              <span>Marajo Tower</span>
              <h2>Tenant/member details</h2>
            </div>
            {loading ? (
              <p className="membership-note">Checking account...</p>
            ) : !user ? (
              <div className="membership-login-panel">
                <p>Please log in or create an account before submitting tenant verification.</p>
                <button type="button" className="btn-primary" onClick={() => openModal("login")}>
                  Log In
                </button>
              </div>
            ) : (
              <form className="membership-form" onSubmit={submit}>
                {message && <div className={`membership-message ${message.ok ? "is-ok" : "is-error"}`}>{message.text}</div>}
                {loadingMembership && <p className="membership-note">Loading your membership details...</p>}
                <label>
                  Full Name
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label>
                  Which company are you from?
                  <select value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}>
                    <option value="tenant_company">Tenant company</option>
                    <option value="marajo_group">Marajo Group</option>
                    <option value="officium_inc">Officium Inc.</option>
                  </select>
                </label>
                <label className="field-full">
                  Company Name
                  <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
                </label>
                <label>
                  Floor Number
                  <input value={form.floor_number} onChange={(e) => setForm({ ...form, floor_number: e.target.value })} required />
                </label>
                <label>
                  Unit Number
                  <input value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} required />
                </label>
                <button className="btn-primary field-full" type="submit" disabled={busy}>
                  {busy ? "Submitting..." : membership ? "Update Verification Details" : "Submit for Verification"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
