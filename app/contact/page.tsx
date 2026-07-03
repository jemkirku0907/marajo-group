"use client";

import { useState, useEffect } from "react";
import { properties } from "@/lib/properties";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", project: "", unit: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  function openMap() {
    setMapLoaded(true);
    setMapOpen(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMapOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mapOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mapOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lead_source: "Website", source_page_url: window.location.href }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Reach our sales team"
        subtitle="Send inquiries, request visits, and explore Marajo Group's residential, office, hospitality, and mixed-use opportunities."
        crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]}
        label="Connect"
      />
      <section className="section contact-section contact-shell">
        <div className="container">
          <div className="contact-modern-grid">
            <div className="contact-intro">
              <div className="section-title">
                <span>Contact</span>
                <h1>Reach our sales team for inquiries, visits, and consultations.</h1>
              </div>
              <p>Our Marajo sales team is ready to assist with property inquiries, brochure downloads, leasing information, and bespoke consultations. Connect with us to explore residential, office, hospitality, and mixed-use opportunities.</p>

              <div className="contact-info-grid">
                <div className="contact-info-item contact-info-card">
                  <span className="contact-info-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity="0" /><path d="M22 6 12 13 2 6" /><path d="M2 6h20v12H2z" /></svg>
                  </span>
                  <span>
                    <span className="label">Email</span>
                    <a className="value contact-link" href="mailto:jemkirku0907@gmail.com">jemkirku0907@gmail.com</a>
                  </span>
                </div>
                <div className="contact-info-item contact-info-card">
                  <span className="contact-info-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </span>
                  <span>
                    <span className="label">Phone</span>
                    <a className="value contact-link" href="tel:+639924562100">09924562100</a>
                  </span>
                </div>
                <div
                  className="contact-info-item contact-info-card contact-info-item--clickable"
                  role="button"
                  tabIndex={0}
                  aria-label="View office location on map"
                  onClick={openMap}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openMap(); }}
                >
                  <span className="contact-info-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </span>
                  <span>
                    <span className="label">Office</span>
                    <span className="value">26th St cor 4th Ave, BGC, Taguig <span className="map-hint">· View map →</span></span>
                  </span>
                </div>

                <div className="contact-info-item contact-info-card">
                  <span className="contact-info-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
                  </span>
                  <span>
                    <span className="label">Social</span>
                    <span className="value">Follow Marajo Group updates and project announcements.</span>
                  </span>
                </div>

                {/* Map Modal */}
                <div className={`map-modal-backdrop${mapOpen ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Office location map" onClick={(e) => { if (e.target === e.currentTarget) setMapOpen(false); }}>
                  <div className="map-modal-box">
                    <div className="map-modal-header">
                      <div>
                        <p className="map-modal-label">Office Location</p>
                        <h4 className="map-modal-title">Marajo Tower, BGC Taguig</h4>
                      </div>
                      <button className="map-modal-close" aria-label="Close map" onClick={() => setMapOpen(false)} type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                    <div className="map-modal-frame">
                      {mapLoaded && (
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.5!2d121.0497!3d14.5497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c914df7f6a4b%3A0x4a7b7c3e5f6d2e1a!2sMarajo+Tower%2C+26th+St+corner+4th+Ave%2C+Bonifacio+Global+City%2C+Taguig%2C+1634+Metro+Manila!5e0!3m2!1sen!2sph!4v1700000000001!5m2!1sen!2sph"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="BGC Taguig Office Map"
                        />
                      )}
                    </div>
                    <div className="map-modal-footer">
                      <a href="https://maps.google.com/?q=Marajo+Tower,+26th+Street+corner+4th+Ave,+Bonifacio+Global+City,+Taguig,+1634+Metro+Manila,+Philippines" target="_blank" rel="noopener" className="map-open-link">
                        Open in Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card contact-card-modern">
              <h3>Send an Inquiry</h3>
              <p className="form-intro">Fill out the form and our team will get back to you within 2 business days.</p>

              {done ? (
                <div className="form-field field-full" style={{ background: "rgba(22,163,74,.08)", color: "#15803d", border: "1px solid rgba(22,163,74,.2)", borderRadius: "10px", padding: ".9rem 1.1rem" }}>
                  Thanks — we got your inquiry! Our team will get back to you within 2 business days.
                </div>
              ) : (
                <form onSubmit={submit} className="form-grid">
                  {error && (
                    <div className="form-field field-full" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,.2)", borderRadius: "10px", padding: ".9rem 1.1rem" }}>
                      {error}
                    </div>
                  )}
                  <div className="form-field field-full floating-field">
                    <label htmlFor="contact-name">Full Name</label>
                    <input id="contact-name" type="text" className="form-control" placeholder="Juan Dela Cruz" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <span className="field-check" aria-hidden="true">✓</span>
                  </div>
                  <div className="form-field floating-field">
                    <label htmlFor="contact-email">Email Address</label>
                    <input id="contact-email" type="email" className="form-control" placeholder="you@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <span className="field-check" aria-hidden="true">✓</span>
                  </div>
                  <div className="form-field floating-field">
                    <label htmlFor="contact-phone">Phone Number</label>
                    <input id="contact-phone" type="tel" className="form-control" placeholder="09XX XXX XXXX" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <span className="field-check" aria-hidden="true">✓</span>
                  </div>
                  <div className="form-field field-full floating-field">
                    <label htmlFor="contact-subject">Subject</label>
                    <input id="contact-subject" type="text" className="form-control" placeholder="Property inquiry" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                    <span className="field-check" aria-hidden="true">✓</span>
                  </div>
                  <div className="form-field">
                    <label htmlFor="contact-project">Project Interest</label>
                    <select id="contact-project" className="form-control" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                      <option value="" disabled>Select a project</option>
                      {properties.map((property) => (
                        <option key={property.slug} value={property.name}>{property.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="contact-unit">Preferred Unit</label>
                    <select id="contact-unit" className="form-control" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                      <option value="" disabled>Select unit type</option>
                      <option>Studio</option>
                      <option>1 Bedroom</option>
                      <option>2 Bedroom</option>
                    </select>
                  </div>
                  <div className="form-field field-full">
                    <label htmlFor="contact-message">Message</label>
                    <textarea id="contact-message" className="form-control" rows={5} placeholder="Tell us your inquiry and preferred schedule" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button className="btn-primary field-full" type="submit" disabled={busy}>
                    {busy ? "Sending…" : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-map-section">
        <div className="container">
          <div className="contact-map-wrap">
            <iframe
              src="https://www.google.com/maps?q=Marajo%20Tower%2026th%20Street%20corner%204th%20Ave%20BGC%20Taguig%20Philippines&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Marajo Group office location"
            />
            <div className="contact-map-card">
              <h3>Marajo Tower</h3>
              <p>26th St corner 4th Ave, Bonifacio Global City, Taguig, Metro Manila.</p>
              <a className="ui-button ui-button--primary" href="https://maps.google.com/?q=Marajo+Tower,+26th+Street+corner+4th+Ave,+Bonifacio+Global+City,+Taguig,+Metro+Manila,+Philippines" target="_blank" rel="noopener">
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .contact-info-item--clickable { cursor: pointer; transition: color 200ms ease; }
        .contact-link { color: inherit; text-decoration: none; }
        .contact-link:hover { color: var(--mg-green, #38A000); text-decoration: underline; }
        .contact-info-item--clickable:hover .value,
        .contact-info-item--clickable:hover .contact-info-icon { color: var(--mg-green, #38A000); }
        .map-hint { font-size: 0.8em; opacity: 0.6; font-weight: 500; }
        .contact-info-item--clickable:hover .map-hint { opacity: 1; color: var(--mg-green, #38A000); }
        .map-modal-backdrop {
          display: none; position: fixed; inset: 0;
          background: rgba(10,20,10,0.55);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          z-index: 10000; align-items: flex-start; justify-content: center; padding: 5.5rem 1rem 1rem;
        }
        .map-modal-backdrop.is-open { display: flex; }
        .map-modal-box {
          background: var(--surface, #fff); border-radius: 16px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.28); width: 100%; max-width: 860px;
          max-height: calc(100vh - 6.5rem);
          display: flex; flex-direction: column;
          animation: mapSlideUp 280ms cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes mapSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .map-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-muted, #e5e7eb); }
        .map-modal-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mg-green, #38A000); margin: 0 0 0.15rem; }
        .map-modal-title { font-family: 'Poppins', sans-serif; font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--heading-color, #0d0d0d); }
        .map-modal-close {
          background: var(--surface-alt, #f3f4f6); border: none; border-radius: 50%;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted, #6b7280); transition: background 200ms, color 200ms; flex-shrink: 0;
        }
        .map-modal-close:hover { background: #fee2e2; color: #dc2626; }
        .map-modal-frame { height: min(52vh, 480px); min-height: 300px; width: 100%; }
        .map-modal-footer { padding: 0.9rem 1.5rem; border-top: 1px solid var(--border-muted, #e5e7eb); display: flex; align-items: center; justify-content: flex-end; }
        .map-open-link { font-size: 0.85rem; font-weight: 600; color: var(--mg-green, #38A000); text-decoration: none; }
        .map-open-link:hover { text-decoration: underline; }
        @media (max-width: 600px) { .map-modal-backdrop { padding-top: 5rem; } .map-modal-frame { height: 320px; min-height: 260px; } .map-modal-box { border-radius: 12px; max-height: calc(100vh - 6rem); } }
      `}</style>
    </main>
  );
}
