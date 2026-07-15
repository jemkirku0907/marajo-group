import Link from "next/link";
import CafeteriaHeroSlider from "./CafeteriaHeroSlider";

export default function CafeteriaPage() {
  return (
    <main className="booking-page cafeteria-page">
      <section className="platform-hero cafeteria-platform-hero">
        <div className="container platform-hero-grid">
          <div>
            <span className="platform-eyebrow">Marajo Cafeteria</span>
            <h1>Meals, snacks, and tenant convenience in one place.</h1>
            <p>
              Preview the cafeteria space today. Online ordering will connect to Enstack once the store link is ready.
            </p>
            <div className="platform-hero-actions">
              <a href="https://enstack.ph/marajo-simply-7" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Order Here
              </a>
              <Link href="/contact" className="btn-secondary">
                Ask About Cafeteria
              </Link>
            </div>
          </div>

          <div className="platform-preview cafeteria-preview">
            <CafeteriaHeroSlider />
            <div className="platform-status-strip">
              <div>
                <strong>Location</strong>
                <span>Marajo Tower</span>
              </div>
              <div>
                <strong>Status</strong>
                <span>Preview Only</span>
              </div>
              <div>
                <strong>Ordering</strong>
                <span>Enstack Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="order" className="booking-section cafeteria-booking-section">
        <div className="container">
          <nav className="booking-steps" aria-label="Cafeteria ordering steps">
            {["Preview Menu", "Order Online", "Pick Up"].map((label, index) => (
              <button key={label} className={`booking-step-btn${index === 0 ? " active" : ""}`} type="button">
                <span className="booking-step-num">{index + 1}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="booking-columns">
            <div className="booking-card">
              <div className="booking-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 10h16" />
                  <path d="M5 10l1.5 9h11L19 10" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <h2>Cafeteria Ordering</h2>
                <span className="header-badge">Step 1</span>
              </div>
              <div className="booking-card-body cafeteria-order-body">
                <p className="form-section-label">Ordering Status</p>
                <p>
                  For now, this page is a visual preview of the cafeteria. The ordering button is ready as the future entry point for Enstack.
                </p>
                <div className="cafeteria-order-actions">
                  <a className="btn-primary" href="https://enstack.ph/marajo-simply-7" target="_blank" rel="noopener noreferrer" aria-disabled="true">
                    Order Here
                  </a>
                  <Link className="btn-secondary" href="/contact">
                    Contact Admin
                  </Link>
                </div>
              </div>
            </div>

            <aside className="booking-summary-card">
              <div className="summary-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11h18" />
                  <path d="M5 11l1 8h12l1-8" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <h3>Cafeteria Summary</h3>
              </div>
              <div className="summary-property">
                <div className="summary-property-icon">
                  <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 3h16v4H4V3Zm1 6h14l-1.2 12H6.2L5 9Zm4 2v7h2v-7H9Zm4 0v7h2v-7h-2Z" />
                  </svg>
                </div>
                <div className="summary-property-info">
                  <strong>Marajo Cafeteria</strong>
                  <span>Marajo Tower tenant dining</span>
                </div>
              </div>
              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-row-label">Service</span>
                  <span className="summary-row-value">Cafeteria</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row-label">Ordering</span>
                  <span className="summary-row-value">Enstack</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row-label">Payment</span>
                  <span className="summary-row-value">Coming Soon</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
