import Link from "next/link";
import CafeteriaHeroSlider from "./CafeteriaHeroSlider";

const cafeteriaImages = [
  {
    src: "/assets/cafeteria1.jpg",
    alt: "Marajo cafeteria dining area with tables and seating",
  },
  {
    src: "/assets/cafeteria%202.jpg",
    alt: "Marajo cafeteria serving counter with prepared food",
  },
  {
    src: "/assets/cafeteria3.jpg",
    alt: "Marajo cafeteria food counter and kitchen service area",
  },
];

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
              <a href="#order" className="btn-primary">
                Order via Enstack
              </a>
              <Link href="/contact" className="btn-secondary">
                Ask About Cafeteria
              </Link>
            </div>
          </div>

          <div className="platform-preview cafeteria-preview">
            <CafeteriaHeroSlider />
            <div className="platform-status-strip">
              <span>
                <strong>Location</strong>
                Marajo Tower
              </span>
              <span>
                <strong>Status</strong>
                Preview Only
              </span>
              <span>
                <strong>Ordering</strong>
                Enstack Soon
              </span>
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
                <h2>Cafeteria Ordering</h2>
                <span className="status-pill warn">Coming Soon</span>
              </div>
              <div className="booking-card-body cafeteria-order-body">
                <p>
                  For now, this page is a visual preview of the cafeteria. The ordering button is ready as the future entry point for Enstack.
                </p>
                <div className="cafeteria-order-actions">
                  <a className="btn-primary" href="#" aria-disabled="true">
                    Order via Enstack
                  </a>
                  <Link className="btn-secondary" href="/contact">
                    Contact Admin
                  </Link>
                </div>
                <div className="booking-message platform-message is-visible cafeteria-note">
                  Enstack URL not connected yet. Once available, this button will go directly to online ordering.
                </div>
              </div>
            </div>

            <aside className="booking-summary-card">
              <div className="summary-card-head">
                <h3>Cafeteria Summary</h3>
                <span className="status-pill">Available Preview</span>
              </div>
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
              <div className="summary-next-step">
                <h4>Next Step</h4>
                <p>Send the Enstack store link when ready and this CTA can be switched from placeholder to live ordering.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section cafeteria-gallery-section">
        <div className="container">
          <div className="section-heading">
            <span>Dining Space</span>
            <h2>Cafeteria photos</h2>
            <p>Current preview images while online ordering is being prepared.</p>
          </div>

          <div className="cafeteria-gallery">
            {cafeteriaImages.map((image) => (
              <figure className="cafeteria-card" key={image.src}>
                <img src={image.src} alt={image.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
