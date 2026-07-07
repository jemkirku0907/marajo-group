"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/AuthContext";

type Slot = { id: number; slot_number: string; floor_level: number; slot_type: string };
type Facility = { id: number; name: string; location: string };
type DriverForm = {
  full_name: string;
  contact_number: string;
  email: string;
  vehicle_type: string;
  plate_number: string;
  vehicle_color: string;
};

const STEPS = ["Check Availability", "Select a Slot", "Driver & Vehicle", "Workflow"];

function fmtPeso(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcHoursPreview(entry: string, exit: string): number {
  if (!entry || !exit) return 0;
  let start = new Date(`2026-01-01T${entry}`).getTime();
  let end = new Date(`2026-01-01T${exit}`).getTime();
  if (end <= start) end += 86400000;
  return Math.max(1, Math.round(((end - start) / 3600000) * 100) / 100);
}

function previewFee(hours: number) {
  const hourlyRate = 50;
  const dailyRate = 500;
  let base = hours > 8 ? Math.min(hours * hourlyRate, dailyRate) : hours * hourlyRate;
  const vat = Math.round(base * 0.12 * 100) / 100;
  const service = Math.round(base * 0.05 * 100) / 100;
  base = Math.round(base * 100) / 100;
  const total = Math.round((base + vat + service) * 100) / 100;
  return { base, vat, service, total };
}

export default function ParkingPage() {
  const { token, requireLogin } = useAuth();

  const [step, setStep] = useState(0);

  const [date, setDate] = useState("");
  const [entry, setEntry] = useState("08:00");
  const [exit, setExit] = useState("17:00");
  const [facilityId, setFacilityId] = useState<number>(0);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [form, setForm] = useState<DriverForm>({
    full_name: "",
    contact_number: "",
    email: "",
    vehicle_type: "sedan",
    plate_number: "",
    vehicle_color: "",
  });

  const [availError, setAvailError] = useState("");
  const [reserveError, setReserveError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await fetch("/api/parking?action=facilities");
        const data = await res.json();
        if (data.success && Array.isArray(data.facilities)) {
          setFacilities(data.facilities);
          setFacilityId(data.facilities[0]?.id || 0);
        }
      } catch (error) {
        console.error("Failed to load parking facilities:", error);
      }
    }
    loadFacilities();
  }, []);

  const hours = calcHoursPreview(entry, exit);
  const fee = previewFee(hours);

  function goTo(idx: number) {
    setStep(idx);
  }

  async function checkAvailability(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setAvailError("");
    setBusy(true);
    try {
      const effectiveFacilityId = facilityId || facilities[0]?.id;
      if (!effectiveFacilityId) {
        setAvailError("Please select a parking facility.");
        return;
      }
      const params = new URLSearchParams({
        action: "availability",
        facility_id: String(effectiveFacilityId),
        reservation_date: date,
        entry_time: entry,
        exit_time: exit,
      });
      const res = await fetch(`/api/parking?${params}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) {
        setAvailError(data.message || "Could not check availability.");
        return;
      }
      setSlots(data.available_slots);
      setSelectedSlot(null);
      goTo(1);
    } catch {
      setAvailError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function pickSlot(s: Slot) {
    setSelectedSlot(s);
  }

  async function reserve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setReserveError("Please select a parking slot first.");
      return;
    }
    setReserveError("");
    setBusy(true);
    try {
      const effectiveFacilityId = facilityId || facilities[0]?.id;
      if (!effectiveFacilityId) {
        setReserveError("Please select a parking facility.");
        return;
      }
      const res = await fetch("/api/parking?action=reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({
          facility_id: effectiveFacilityId,
          slot_id: selectedSlot.id,
          reservation_date: date,
          entry_time: entry,
          exit_time: exit,
          ...form,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setReserveError(data.message || "Booking failed.");
        return;
      }
      setResult(data);
      window.dispatchEvent(new CustomEvent("marajo:booking-history-refresh"));
      goTo(3);
    } catch {
      setReserveError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function downloadReceipt() {
    if (!result) return;
    const lines = [
      "MARAJO TOWER PARKING — RECEIPT",
      `Reference: ${result.reference}`,
      `Slot: ${selectedSlot?.slot_number ?? "—"}`,
      `Date: ${date}`,
      `Time: ${entry} - ${exit}`,
      `Driver: ${form.full_name}`,
      `Vehicle: ${form.vehicle_type} (${form.plate_number})`,
      `Base Fee: ${fmtPeso(result.fee_breakdown?.base ?? 0)}`,
      `VAT (12%): ${fmtPeso(result.fee_breakdown?.vat ?? 0)}`,
      `Service Fee (5%): ${fmtPeso(result.fee_breakdown?.service ?? 0)}`,
      `Total Amount: ${fmtPeso(result.fee ?? 0)}`,
      "Payment: Collect at gate on arrival",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.reference || "parking-receipt"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function newReservation() {
    setStep(0);
    setSlots(null);
    setSelectedSlot(null);
    setResult(null);
    setAvailError("");
    setReserveError("");
    setForm({ full_name: "", contact_number: "", email: "", vehicle_type: "sedan", plate_number: "", vehicle_color: "" });
  }

  const stepIcons = [
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    <svg key="3" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  ];
  const mobileLabels = ["Availability", "Slots", "Details", "Workflow"];

  return (
    <main className="booking-page">
      {/* Hero */}
      <section className="platform-hero">
        <div className="container platform-hero-grid">
          <div>
            <span className="platform-eyebrow">Marajo Tower Smart Parking</span>
            <h1>Reserve parking with live slots, vehicle details, and automated fees.</h1>
            <p>Check available spaces by date and time, choose the best slot, submit vehicle information, and generate a reservation total with VAT and service fee breakdown.</p>
            <div className="platform-hero-actions">
              <a href="#reserve" className="btn-primary">Reserve a Slot</a>
              <a href="#history" className="btn-secondary" onClick={(e) => { e.preventDefault(); goTo(3); }}>View Workflow</a>
            </div>
          </div>
          <div className="platform-preview">
            <img src="/assets/Parking.jpg" alt="Marajo Tower exterior" />
            <div className="platform-status-strip">
              <div><strong>₱50</strong><span>Hourly rate</span></div>
              <div><strong>₱500</strong><span>Daily max</span></div>
              <div><strong>₱5k</strong><span>Monthly rate</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="reserve" className="booking-section">
        <div className="container">

          {/* Desktop step tabs */}
          <nav className="booking-steps" role="tablist" aria-label="Booking steps">
            {STEPS.map((label, i) => (
              <button
                key={label}
                className={`booking-step-btn${step === i ? " active" : ""}`}
                role="tab"
                aria-selected={step === i}
                onClick={() => goTo(i)}
                type="button"
              >
                <span className="booking-step-num">{i + 1}</span>
                {stepIcons[i]}
                {label === "Driver & Vehicle" ? <>Driver &amp; Vehicle</> : label}
              </button>
            ))}
          </nav>

          {/* Mobile tab bar */}
          <div className="wf-tab-bar" role="tablist">
            {mobileLabels.map((label, i) => (
              <button
                key={label}
                className={`wf-tab${step === i ? " active" : ""}`}
                role="tab"
                aria-selected={step === i}
                onClick={() => goTo(i)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="wf-track">
            {/* PANEL 0 — Check Availability */}
            <div className={`wf-panel${step === 0 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <h2>Check Availability</h2>
                    <span className="header-badge">Step 1</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={checkAvailability}>
                      <p className="form-section-label">Facility</p>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="facility_id">Parking Facility</label>
                          <div className="form-input-wrap">
                            <select
                              id="facility_id"
                              name="facility_id"
                              value={facilityId || ""}
                              onChange={(e) => setFacilityId(Number(e.target.value))}
                            >
                              {facilities.length > 0 ? (
                                facilities.map((facility) => (
                                  <option key={facility.id} value={facility.id}>
                                    {facility.name}
                                  </option>
                                ))
                              ) : (
                                <option value="">Loading facilities…</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label" style={{ marginTop: "1.25rem" }}>Reservation Window</p>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="reservation_date">Reservation Date</label>
                          <div className="form-input-wrap">
                            <input id="reservation_date" type="date" name="reservation_date" required value={date} onChange={(e) => setDate(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <div className="form-field">
                          <label className="form-label" htmlFor="entry_time">Entry Time</label>
                          <div className="form-input-wrap">
                            <input id="entry_time" type="time" name="entry_time" required value={entry} onChange={(e) => setEntry(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="exit_time">Exit Time</label>
                          <div className="form-input-wrap">
                            <input id="exit_time" type="time" name="exit_time" required value={exit} onChange={(e) => setExit(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-secondary" type="submit" disabled={busy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        {busy ? "Checking…" : "Check Available Slots"}
                      </button>
                    </form>
                    {availError && <div className="booking-message platform-message is-visible" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626" }}>{availError}</div>}
                    <button className="btn-next-step" onClick={() => goTo(1)} type="button">
                      Already checked? Skip to Slot Selection →
                    </button>
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Reservation Summary</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-icon">
                      <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M19,2 C20.6568542,2 22,3.34314575 22,5 L22,19 C22,20.6568542 20.6568542,22 19,22 L5,22 C3.34314575,22 2,20.6568542 2,19 L2,5 C2,3.34314575 3.34314575,2 5,2 L19,2 Z M19,4 L5,4 C4.44771525,4 4,4.44771525 4,5 L4,19 C4,19.5522847 4.44771525,20 5,20 L19,20 C19.5522847,20 20,19.5522847 20,19 L20,5 C20,4.44771525 19.5522847,4 19,4 Z M9,6 L12,6 C14.209139,6 16,7.790861 16,10 C16,12.1421954 14.3160315,13.8910789 12.1996403,13.9951047 L12,14 L10,14 L10,17 C10,17.5522847 9.55228475,18 9,18 C8.44771525,18 8,17.5522847 8,17 L8,7 C8,6.44771525 8.44771525,6 9,6 L12,6 L9,6 Z M12,8 L10,8 L10,12 L12,12 L12.1492623,11.9945143 C13.1841222,11.9181651 14,11.0543618 14,10 C14,8.8954305 13.1045695,8 12,8 Z" />
                      </svg>
                    </div>
                    <div className="summary-property-info">
                      <strong>Marajo Tower Parking</strong>
                      <span>BGC, Taguig City</span>
                    </div>
                  </div>
                  <div className="summary-rows" aria-live="polite">
                    <div className="summary-row">
                      <span className="summary-row-label">Status</span>
                      <span className="summary-row-value"><span className="status-pill">Available</span></span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Selected Slot</span>
                      <span className="summary-row-value">{selectedSlot ? selectedSlot.slot_number : "None"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Duration</span>
                      <span className="summary-row-value">{hours ? `${hours} hours` : "—"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Reservation Fee</span>
                      <span className="summary-row-value">{fmtPeso(fee.base)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">VAT (12%)</span>
                      <span className="summary-row-value">{fmtPeso(fee.vat)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Service Fee (5%)</span>
                      <span className="summary-row-value">{fmtPeso(fee.service)}</span>
                    </div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">Total Amount</span>
                    <span className="value">{fmtPeso(fee.total)}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>Rate Guide</strong>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>₱50 / hour</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>₱500 whole-day cap</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>₱5,000 monthly rate</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>24/7 CCTV-monitored</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 1 — Select Slot */}
            <div className={`wf-panel${step === 1 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                    <h2>Available Slots</h2>
                    <span className="header-badge">Step 2</span>
                  </div>
                  <div className="booking-card-body">
                    <p style={{ margin: "0 0 1.1rem", color: "var(--text-muted)", fontSize: ".88rem", lineHeight: 1.6 }}>
                      Tap a slot below to select it. Run Step 1 first to load live availability.
                    </p>
                    <div className="slot-board-wrap">
                      <div className="slot-board" aria-live="polite">
                        {!slots ? (
                          <p>Check availability first to load live slot inventory.</p>
                        ) : slots.length === 0 ? (
                          <p>No slots available for that window. Try a different date or time.</p>
                        ) : (
                          slots.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className={`slot-tile${selectedSlot?.id === s.id ? " is-selected" : ""}`}
                              onClick={() => {
                                pickSlot(s);
                                setTimeout(() => goTo(2), 350);
                              }}
                            >
                              <strong>{s.slot_number}</strong>
                              <span>{(s.slot_type || "standard")} · L{s.floor_level || 1}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <button className="btn-next-step" onClick={() => goTo(2)} type="button" style={{ marginTop: "1rem" }}>
                      Slot selected? Continue to Driver Details →
                    </button>
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Selected Slot</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>{selectedSlot ? selectedSlot.slot_number : "None selected"}</strong>
                      <span>Marajo Tower — Tap a slot to select</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span className="summary-row-label">Status</span>
                      <span className="summary-row-value"><span className="status-pill">{selectedSlot ? "Selected" : "Awaiting selection"}</span></span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Duration</span>
                      <span className="summary-row-value">{hours ? `${hours} hours` : "—"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Estimated Total</span>
                      <span className="summary-row-value">{fmtPeso(fee.total)}</span>
                    </div>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>Next Step</strong>
                      Select a slot from the board, then go to Step 3 to enter driver and vehicle details.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2 — Driver & Vehicle */}
            <div className={`wf-panel${step === 2 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <h2>Driver &amp; Vehicle Details</h2>
                    <span className="header-badge">Step 3</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={reserve}>
                      <p className="form-section-label">Driver Information</p>
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
                          <label className="form-label" htmlFor="driver_email">Email Address</label>
                          <div className="form-input-wrap">
                            <input id="driver_email" type="email" placeholder="you@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label" style={{ marginTop: "1.1rem" }}>Vehicle Information</p>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="vehicle_type">Vehicle Type</label>
                          <div className="form-input-wrap">
                            <select id="vehicle_type" required value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                              <option value="motorcycle">Motorcycle</option>
                              <option value="sedan">Sedan</option>
                              <option value="suv">SUV</option>
                              <option value="van">Van</option>
                              <option value="pickup">Pickup</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="plate_number">Plate Number</label>
                          <div className="form-input-wrap">
                            <input id="plate_number" placeholder="ABC 1234" required value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="vehicle_color">Vehicle Color</label>
                          <div className="form-input-wrap no-icon">
                            <input id="vehicle_color" placeholder="e.g. White, Silver, Black" value={form.vehicle_color} onChange={(e) => setForm({ ...form, vehicle_color: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-primary" type="submit" disabled={busy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {busy ? "Confirming…" : "Confirm Reservation"}
                      </button>
                    </form>
                    {reserveError && <div className="booking-message platform-message is-visible" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626" }}>{reserveError}</div>}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Booking Summary</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>Marajo Tower Parking</strong>
                      <span>Slot: <strong>{selectedSlot ? selectedSlot.slot_number : "None"}</strong></span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Duration</span><span className="summary-row-value">{hours ? `${hours} hours` : "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Reservation Fee</span><span className="summary-row-value">{fmtPeso(fee.base)}</span></div>
                    <div className="summary-row"><span className="summary-row-label">VAT (12%)</span><span className="summary-row-value">{fmtPeso(fee.vat)}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Service Fee (5%)</span><span className="summary-row-value">{fmtPeso(fee.service)}</span></div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">Total Amount</span>
                    <span className="value">{fmtPeso(fee.total)}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>Payment</strong>
                      Collected at the gate on arrival. A confirmation email will be sent after booking.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 3 — Confirmation */}
            <div id="history" className={`wf-panel${step === 3 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-card" style={{ maxWidth: 640, margin: "0 auto" }}>
                <div className="booking-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <h2>{result ? "Booking Confirmed!" : "Workflow"}</h2>
                  {result && <span className="header-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16a34a", borderColor: "rgba(22,163,74,.25)" }}>Instant Confirm</span>}
                </div>
                <div className="booking-card-body" style={{ textAlign: "center" }}>
                  {!result ? (
                    <p style={{ fontSize: ".9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      Complete steps 1–3 to check availability, choose a slot, and submit driver &amp; vehicle details. Your confirmation and receipt will appear here.
                    </p>
                  ) : (
                    <>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".5rem" }}>Your parking slot is reserved!</h3>
                      <p style={{ fontSize: ".95rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Reference: {result.reference}</p>

                      <div style={{ background: "var(--section-alt, rgba(242,253,245,.95))", border: "1px solid var(--border-muted, rgba(13,13,13,.08))", borderRadius: ".75rem", padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                        {[
                          ["Facility", "Marajo Tower Parking"],
                          ["Slot", selectedSlot?.slot_number ?? "—"],
                          ["Date", date || "—"],
                          ["Time", `${entry} – ${exit}`],
                          ["Driver", form.full_name || "—"],
                          ["Vehicle", `${form.vehicle_type} · ${form.plate_number}`],
                          ["Base Fee", fmtPeso(result.fee_breakdown?.base ?? 0)],
                          ["VAT (12%)", fmtPeso(result.fee_breakdown?.vat ?? 0)],
                          ["Service Fee (5%)", fmtPeso(result.fee_breakdown?.service ?? 0)],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".45rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{k}</span><strong>{v}</strong>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".45rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Total Amount</span>
                          <strong style={{ color: "var(--mg-green, #3e8b28)", fontSize: "1.05rem" }}>{fmtPeso(result.fee ?? 0)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".45rem 0" }}>
                          <span style={{ color: "var(--text-muted)" }}>Payment</span><strong>Collect at gate on arrival</strong>
                        </div>
                      </div>

                      <p style={{ fontSize: ".84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>A receipt has been sent to your email. Present your reference number at the parking entrance.</p>
                      <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
                        <button onClick={downloadReceipt} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>💾 Download Receipt</button>
                        <button onClick={() => window.print()} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>🖨 Print Receipt</button>
                        <button onClick={newReservation} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>New Reservation</button>
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
  );
}
