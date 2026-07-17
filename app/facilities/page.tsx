"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, authHeaders } from "@/lib/AuthContext";
import { FacilityType, properties, Property, PropertyBookableFacility } from "@/lib/properties";

const STEPS = ["Check Availability", "Your Details", "Confirmation"];
const mobileLabels = ["Availability", "Details", "Confirm"];

const FACILITY_TYPES: { key: FacilityType; label: string; helper: string }[] = [
  { key: "meeting-room", label: "Meeting Room", helper: "Business rooms for Marajo Tower tenants and guests." },
  { key: "overnight-stay", label: "Units / Studios", helper: "Overnight stay requests for residential and hospitality properties." },
  { key: "storage", label: "Storage", helper: "Secure storage requests for Space Solutions." },
  { key: "court", label: "Court Booking", helper: "Instant court availability and confirmation." },
];

type CheckedSlot = {
  date: string;
  start: string;
  end: string;
  facilityType: FacilityType;
  propertySlug: string;
};

function fmtPeso(n: number) {
  return `PHP ${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  let s = new Date(`2026-01-01T${start}`).getTime();
  let e = new Date(`2026-01-01T${end}`).getTime();
  if (e <= s) e += 86400000;
  return Math.max(1, Math.round(((e - s) / 3600000) * 100) / 100);
}

function propertiesForFacility(type: FacilityType): Property[] {
  return properties.filter((property) => property.bookableFacilities?.some((facility) => facility.type === type));
}

function getFacility(property: Property | undefined, type: FacilityType): PropertyBookableFacility | undefined {
  return property?.bookableFacilities?.find((facility) => facility.type === type);
}

function getPreviewFee(facilityType: FacilityType, hours: number) {
  if (facilityType === "court") return hours * 1000;
  if (facilityType === "meeting-room") return hours * 1500;
  return 0;
}

export default function FacilitiesPage() {
  /* Disabled Facilities booking state, calculations, validation, and handlers.
     Restore this block together with the commented JSX and Facilities API routes.
  const { token, requireLogin } = useAuth();

  const [step, setStep] = useState(0);
  const [facilityType, setFacilityType] = useState<FacilityType>("meeting-room");
  const [propertySlug, setPropertySlug] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("10:00");

  const [availBadge, setAvailBadge] = useState<"Available" | "Booked" | "Request">("Request");
  const [availMsg, setAvailMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checked, setChecked] = useState<CheckedSlot | null>(null);

  const [form, setForm] = useState({ full_name: "", contact_number: "", email: "", notes: "" });
  const [bookMsg, setBookMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tenantStatus, setTenantStatus] = useState<{ verified: boolean; status: string; message: string } | null>(null);

  const eligibleProperties = useMemo(() => propertiesForFacility(facilityType), [facilityType]);
  const selectedProperty = eligibleProperties.find((property) => property.slug === propertySlug) || eligibleProperties[0];
  const selectedFacility = getFacility(selectedProperty, facilityType);
  const selectedType = FACILITY_TYPES.find((type) => type.key === facilityType) || FACILITY_TYPES[0];
  const hours = calcHours(start, end);
  const previewBase = getPreviewFee(facilityType, hours);
  const isInstantCourt = facilityType === "court";

  useEffect(() => {
    if (!selectedProperty) return;
    if (selectedProperty.slug !== propertySlug) setPropertySlug(selectedProperty.slug);
  }, [propertySlug, selectedProperty]);

  useEffect(() => {
    if (!token) {
      setTenantStatus(null);
      return;
    }
    fetch("/api/tenant-membership?action=status", { headers: authHeaders(token), cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTenantStatus({ verified: !!data.verified, status: data.status, message: data.message });
      })
      .catch(() => setTenantStatus(null));
  }, [token]);

  function resetAvailability(nextType = facilityType) {
    setStep(0);
    setIsAvailable(false);
    setChecked(null);
    setResult(null);
    setBookMsg(null);
    setAvailMsg(null);
    setAvailBadge(nextType === "court" ? "Available" : "Request");
  }

  async function checkAvailability(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !start || !end || !selectedProperty || !selectedFacility) {
      setAvailMsg({ text: "Please fill in all fields.", ok: false });
      return;
    }
    if (!requireLogin()) return;
    if (tenantStatus && !tenantStatus.verified) {
      setAvailMsg({ text: tenantStatus.message, ok: false });
      return;
    }
    setAvailMsg(null);
    setBusy(true);
    try {
      if (isInstantCourt) {
        const params = new URLSearchParams({ action: "availability", booking_date: date, start_time: start, end_time: end });
        const res = await fetch(`/api/facilities?${params}`, { headers: authHeaders(token) });
        const data = await res.json();
        if (!data.success) {
          setAvailMsg({ text: data.message || "Error checking availability.", ok: false });
          return;
        }
        setIsAvailable(!!data.available);
        setAvailBadge(data.available ? "Available" : "Booked");
        if (data.available) {
          setChecked({ date, start, end, facilityType, propertySlug: selectedProperty.slug });
          setAvailMsg({ text: "The court is available. Proceed to Step 2 to complete your booking.", ok: true });
          setTimeout(() => setStep(1), 500);
        } else {
          setAvailMsg({ text: "The court is already booked during that time. Please choose a different slot.", ok: false });
        }
        return;
      }

      setIsAvailable(true);
      setAvailBadge("Request");
      setChecked({ date, start, end, facilityType, propertySlug: selectedProperty.slug });
      setAvailMsg({
        text: `${selectedFacility.label} requests are routed to the Marajo team for confirmation. Proceed to Step 2 to submit your details.`,
        ok: true,
      });
      setTimeout(() => setStep(1), 500);
    } catch {
      setAvailMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!isAvailable || !checked || !selectedProperty || !selectedFacility) {
      setBookMsg({ text: "Please go back to Step 1 and confirm availability first.", ok: false });
      return;
    }
    setBookMsg(null);
    setBusy(true);
    try {
      if (isInstantCourt) {
        const res = await fetch("/api/facilities?action=book", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders(token) },
          body: JSON.stringify({ booking_date: checked.date, start_time: checked.start, end_time: checked.end, ...form }),
        });
        const data = await res.json();
        if (!data.success) {
          setIsAvailable(false);
          setAvailBadge("Booked");
          setBookMsg({ text: data.message || "Booking failed. Please re-check availability.", ok: false });
          setTimeout(() => setStep(0), 2000);
          return;
        }
        setResult({ ...data, mode: "instant", title: selectedFacility.label });
        window.dispatchEvent(new CustomEvent("marajo:booking-history-refresh"));
        setStep(2);
        return;
      }

      const message = [
        `Facility request: ${selectedFacility.label}`,
        `Property: ${selectedProperty.name}`,
        `Preferred date: ${checked.date}`,
        `Preferred time: ${checked.start} - ${checked.end}`,
        `Notes: ${form.notes || "None"}`,
      ].join("\n");
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({
          name: form.full_name,
          email: form.email,
          phone: form.contact_number,
          subject: `${selectedFacility.label} booking request`,
          property_name: selectedProperty.name,
          project: selectedProperty.name,
          unit_name: selectedFacility.label,
          unit_type: selectedType.label,
          message,
          lead_source: "Facilities Booking",
          source_page_url: typeof window !== "undefined" ? window.location.href : "/facilities",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setBookMsg({ text: data.message || "Request failed. Please try again.", ok: false });
        return;
      }
      setResult({
        mode: "request",
        booking_id: data.inquiry_id,
        title: selectedFacility.label,
        fee: previewBase,
      });
      setStep(2);
    } catch {
      setBookMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  function downloadReceipt() {
    if (!result || !checked || !selectedProperty || !selectedFacility) return;
    const reference = result.mode === "instant" ? `FAC-${result.booking_id}` : `REQ-${result.booking_id}`;
    const lines = [
      "MARAJO GROUP FACILITY REQUEST",
      `Reference: ${reference}`,
      `Facility: ${selectedFacility.label}`,
      `Property: ${selectedProperty.name}`,
      `Date: ${checked.date}`,
      `Time: ${checked.start} - ${checked.end}`,
      `Fee Preview: ${previewBase ? fmtPeso(previewBase) : selectedFacility.rateLabel}`,
      result.mode === "instant" ? "Status: Confirmed" : "Status: Submitted for team confirmation",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bookAnother() {
    resetAvailability();
    setForm({ full_name: "", contact_number: "", email: "", notes: "" });
  }

  const stepIcons = [
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  ];
  */

  return (
    <>
      {/* Disabled entire Facilities frontend booking section.
    <main className="booking-page">
      <section className="platform-hero">
        <div className="container platform-hero-grid">
          <div>
            <span className="platform-eyebrow">Marajo Facilities Booking</span>
            <h1>Reserve the right facility for the right Marajo property.</h1>
            <p>Select a facility type and the property list will show only valid matches, from Marajo Tower meeting rooms to Space Solutions storage.</p>
            <div className="platform-hero-actions">
              <a href="#reserve" className="btn-primary">Start Booking</a>
              <a href="#reserve" className="btn-secondary">Check Options</a>
            </div>
          </div>
          <div className="platform-preview">
            <img src={selectedFacility?.image || "/assets/marajo-tower.jpg"} alt={selectedFacility?.label || "Marajo facility"} />
            <div className="platform-status-strip">
              <div><strong>{FACILITY_TYPES.length}</strong><span>Facility types</span></div>
              <div><strong>{eligibleProperties.length}</strong><span>Valid properties</span></div>
              <div><strong>{isInstantCourt ? "Instant" : "Request"}</strong><span>Confirmation</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="reserve" className="booking-section">
        <div className="container">
          {token && tenantStatus && !tenantStatus.verified && (
            <div className="tenant-access-banner">
              <div>
                <span className="membership-status-pill status-pending">{tenantStatus.status}</span>
                <h2>Tenant verification required</h2>
                <p>{tenantStatus.message} Submit your Marajo Tower tenant details before using request forms.</p>
              </div>
              <a className="btn-primary" href="/membership">Verify Tenant Access</a>
            </div>
          )}
          <nav className="booking-steps" role="tablist" aria-label="Facilities booking steps">
            {STEPS.map((label, i) => (
              <button key={label} className={`booking-step-btn${step === i ? " active" : ""}`} role="tab" aria-selected={step === i} onClick={() => setStep(i)} type="button">
                <span className="booking-step-num">{i + 1}</span>
                {stepIcons[i]}
                {label}
              </button>
            ))}
          </nav>

          <div className="wf-tab-bar" role="tablist">
            {mobileLabels.map((label, i) => (
              <button key={label} className={`wf-tab${step === i ? " active" : ""}`} role="tab" aria-selected={step === i} onClick={() => setStep(i)} type="button">
                {label}
              </button>
            ))}
          </div>

          <div className="wf-track">
            <div className={`wf-panel${step === 0 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <h2>Choose Facility</h2>
                    <span className="header-badge">Step 1</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={checkAvailability}>
                      <p className="form-section-label">Facility &amp; Property</p>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="facility_type">Facility Type</label>
                          <div className="form-input-wrap no-icon">
                            <select
                              id="facility_type"
                              value={facilityType}
                              onChange={(e) => {
                                const nextType = e.target.value as FacilityType;
                                setFacilityType(nextType);
                                const firstProperty = propertiesForFacility(nextType)[0];
                                setPropertySlug(firstProperty?.slug || "");
                                resetAvailability(nextType);
                              }}
                            >
                              {FACILITY_TYPES.map((type) => (
                                <option key={type.key} value={type.key}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="facility_property">Property</label>
                          <div className="form-input-wrap no-icon">
                            <select id="facility_property" required value={selectedProperty?.slug || ""} onChange={(e) => { setPropertySlug(e.target.value); resetAvailability(); }}>
                              {eligibleProperties.map((property) => (
                                <option key={property.slug} value={property.slug}>{property.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label">Date &amp; Time</p>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="booking_date">Booking Date</label>
                          <div className="form-input-wrap">
                            <input id="booking_date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <div className="form-field">
                          <label className="form-label" htmlFor="start_time">Start Time</label>
                          <div className="form-input-wrap">
                            <input id="start_time" type="time" required value={start} onChange={(e) => setStart(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="end_time">End Time</label>
                          <div className="form-input-wrap">
                            <input id="end_time" type="time" required value={end} onChange={(e) => setEnd(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-secondary" type="submit" disabled={busy}>
                        {busy ? "Checking..." : isInstantCourt ? "Check Court Availability" : "Continue Request"}
                      </button>
                    </form>
                    {availMsg && (
                      <div className="booking-message platform-message is-visible" style={{ background: availMsg.ok ? "rgba(22,163,74,.08)" : "rgba(220,38,38,.08)", color: availMsg.ok ? "#15803d" : "#b91c1c" }}>
                        {availMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Facility Preview</h3></div>
                  {selectedFacility && (
                    <img src={selectedFacility.image} alt={selectedFacility.label} style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "14px", marginBottom: "1rem" }} />
                  )}
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>{selectedFacility?.label || selectedType.label}</strong>
                      <span>{selectedProperty?.name || "Select a property"}</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Status</span><span className="summary-row-value"><span className="status-pill">{availBadge}</span></span></div>
                    <div className="summary-row"><span className="summary-row-label">Duration</span><span className="summary-row-value">{hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "-"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Rate</span><span className="summary-row-value">{selectedFacility?.rateLabel || "-"}</span></div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">{previewBase ? "Fee Preview" : "Pricing"}</span>
                    <span className="value">{previewBase ? fmtPeso(previewBase) : "On request"}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>{selectedType.label}</strong>
                      <p style={{ margin: ".4rem 0 0" }}>{selectedFacility?.description || selectedType.helper}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`wf-panel${step === 1 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <h2>Your Details</h2>
                    <span className="header-badge">Step 2</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={book}>
                      <p className="form-section-label">Contact Information</p>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="full_name">Full Name</label>
                          <div className="form-input-wrap">
                            <input id="full_name" placeholder="Juan dela Cruz" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="contact_number">Contact Number</label>
                          <div className="form-input-wrap">
                            <input id="contact_number" placeholder="09XXXXXXXXX" required value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="booker_email">Email Address</label>
                          <div className="form-input-wrap">
                            <input id="booker_email" type="email" placeholder="you@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label" style={{ marginTop: "1.1rem" }}>Notes <small style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</small></p>
                      <div className="field-group single">
                        <div className="form-field">
                          <div className="form-input-wrap no-icon">
                            <textarea placeholder={`Tell us anything useful about your ${selectedFacility?.label || "facility"} request.`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-primary" type="submit" disabled={busy}>
                        {busy ? "Submitting..." : isInstantCourt ? "Confirm Court Booking" : "Submit Facility Request"}
                      </button>
                    </form>
                    {bookMsg && (
                      <div className="booking-message platform-message is-visible" style={{ background: bookMsg.ok ? "rgba(22,163,74,.08)" : "rgba(220,38,38,.08)", color: bookMsg.ok ? "#15803d" : "#b91c1c" }}>
                        {bookMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Booking Summary</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>{selectedFacility?.label || selectedType.label}</strong>
                      <span>{checked ? `${checked.date} - ${checked.start} to ${checked.end}` : "-"}</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Property</span><span className="summary-row-value">{selectedProperty?.name || "-"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Date</span><span className="summary-row-value">{checked?.date ?? "-"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Time</span><span className="summary-row-value">{checked ? `${checked.start} - ${checked.end}` : "-"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Duration</span><span className="summary-row-value">{hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "-"}</span></div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">{previewBase ? "Fee Preview" : "Pricing"}</span>
                    <span className="value">{previewBase ? fmtPeso(previewBase) : "On request"}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>What happens next</strong>
                      {isInstantCourt
                        ? "Court bookings are confirmed instantly. Payment is collected on-site."
                        : "Your request will be sent to the Marajo team for confirmation and next steps."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`wf-panel${step === 2 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-card" style={{ maxWidth: 640, margin: "0 auto" }}>
                <div className="booking-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <h2>{result ? (result.mode === "instant" ? "Booking Confirmed!" : "Request Submitted!") : "Confirmation"}</h2>
                  {result && <span className="header-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16a34a", borderColor: "rgba(22,163,74,.25)" }}>{result.mode === "instant" ? "Instant Confirm" : "For Review"}</span>}
                </div>
                <div className="booking-card-body" style={{ textAlign: "center" }}>
                  {!result ? (
                    <p style={{ fontSize: ".9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      Complete steps 1-2 to check availability and submit your details. Your confirmation will appear here.
                    </p>
                  ) : (
                    <>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".5rem" }}>
                        {result.mode === "instant" ? "Your court is reserved." : "Your facility request has been sent."}
                      </h3>
                      <p style={{ fontSize: ".95rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                        Reference: {result.mode === "instant" ? `FAC-${result.booking_id}` : `REQ-${result.booking_id}`}
                      </p>

                      <div style={{ background: "var(--section-alt, rgba(242,253,245,.95))", border: "1px solid var(--border-muted, rgba(13,13,13,.08))", borderRadius: ".75rem", padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Facility</span><strong>{selectedFacility?.label}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Property</span><strong>{selectedProperty?.name}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Date</span><strong>{checked?.date ?? "-"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: ".88rem", padding: ".4rem 0" }}>
                          <span style={{ color: "var(--text-muted)" }}>Time</span><strong>{checked ? `${checked.start} - ${checked.end}` : "-"}</strong>
                        </div>
                      </div>

                      <p style={{ fontSize: ".84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                        {result.mode === "instant"
                          ? "A receipt has been sent to your email. Present your reference number on your booking day."
                          : "The Marajo team will review this request and contact you with confirmation details."}
                      </p>

                      <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
                        <button onClick={downloadReceipt} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".75rem 1.75rem" }}>Download Reference</button>
                        <button onClick={bookAnother} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".75rem 1.75rem" }}>Book Another</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="wf-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`wf-dot${step === i ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    </main>
      */}
    </>
  );
}
